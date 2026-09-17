import {
  AIProvider,
  SanitizedStudentContext,
  SuggestedAction,
  ImprovementPlanResult,
  CohortSummaryPayload,
  CohortSynthesisResult,
  CopilotAnalysisResult,
  copilotAnalysisSchema,
} from "../types";
import { COPILOT_SYSTEM_PROMPT, buildCopilotUserPrompt } from "../prompts";
import { validateEvidenceAgainstContext } from "../evidence-validator";

export class OpenRouterProvider implements AIProvider {
  name: "openrouter" = "openrouter";
  private apiKey: string;
  public model: string;

  constructor(
    apiKey: string,
    model: string = process.env.OPENROUTER_MODEL || "google/gemini-3.5-flash-lite"
  ) {
    this.apiKey = apiKey;
    this.model = model;
  }

  get modelName(): string {
    return this.model;
  }

  async generateCopilotInsights(
    context: SanitizedStudentContext
  ): Promise<CopilotAnalysisResult> {
    const userPrompt = buildCopilotUserPrompt(context);
    const rawResult = await this.callOpenRouter(COPILOT_SYSTEM_PROMPT, userPrompt);

    // Strict schema validation using Zod
    let validated: CopilotAnalysisResult;
    try {
      validated = copilotAnalysisSchema.parse(rawResult);
    } catch (zodErr: any) {
      console.error("[OpenRouter] Schema validation error:", zodErr);
      const err = new Error("AI response failed schema validation.");
      (err as any).code = "AI_VALIDATION_ERROR";
      throw err;
    }

    // Cross-validate evidence against the actual SanitizedStudentContext
    try {
      validateEvidenceAgainstContext(validated.recommendations, context);
    } catch (evidenceErr: any) {
      console.error("[OpenRouter] Evidence validation error:", evidenceErr);
      const err = new Error(`AI evidence validation failed: ${evidenceErr.message}`);
      (err as any).code = "AI_VALIDATION_ERROR";
      throw err;
    }

    return validated;
  }

  private cleanJsonString(str: string): string {
    let cleaned = str.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }
    return cleaned.trim();
  }

  private async callOpenRouter(systemPrompt: string, userPrompt: string): Promise<any> {
    if (!this.apiKey || this.apiKey.trim() === "") {
      const err = new Error("AI service is not configured. OPENROUTER_API_KEY is missing.");
      (err as any).code = "MISSING_CONFIGURATION";
      throw err;
    }

    let res: Response;
    try {
      res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://www.madebysid.space",
          "X-Title": "ARGUS MENTOR OS",
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.2,
          max_tokens: 2500,
          response_format: { type: "json_object" },
        }),
        signal: AbortSignal.timeout(25000),
      });
    } catch (fetchErr: any) {
      if (
        fetchErr.name === "TimeoutError" ||
        fetchErr.message?.includes("timeout") ||
        fetchErr.name === "AbortError"
      ) {
        const err = new Error("AI request timed out after 25 seconds. Please try again.");
        (err as any).code = "OPENROUTER_TIMEOUT";
        throw err;
      }
      const err = new Error("Unable to reach AI service. Please check network connectivity.");
      (err as any).code = "NETWORK_ERROR";
      throw err;
    }

    if (!res.ok) {
      const status = res.status;
      let errorDetail = "";
      try {
        const errJson = await res.json();
        errorDetail = errJson?.error?.message || "";
      } catch {
        errorDetail = await res.text().catch(() => "");
      }

      if (status === 401 || status === 403) {
        const err = new Error("AI service authentication failed. Please verify OPENROUTER_API_KEY.");
        (err as any).code = "OPENROUTER_AUTH_ERROR";
        throw err;
      }
      if (status === 402) {
        const err = new Error(`AI credit limit reached or token limit exceeded: ${errorDetail || "Insufficient credits"}`);
        (err as any).code = "OPENROUTER_CREDIT_ERROR";
        throw err;
      }
      if (status === 404) {
        const err = new Error(`AI model not found or unavailable on OpenRouter: ${this.model}`);
        (err as any).code = "OPENROUTER_MODEL_ERROR";
        throw err;
      }
      if (status === 429) {
        const err = new Error("AI rate limit reached. Please wait a moment before generating more insights.");
        (err as any).code = "OPENROUTER_RATE_LIMIT";
        throw err;
      }
      const err = new Error(`OpenRouter responded with status ${status}: ${errorDetail || "Generation aborted."}`);
      (err as any).code = "OPENROUTER_PROVIDER_ERROR";
      throw err;
    }

    let data: any;
    try {
      data = await res.json();
    } catch {
      const err = new Error("AI provider returned invalid JSON response.");
      (err as any).code = "OPENROUTER_INVALID_RESPONSE";
      throw err;
    }

    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      const err = new Error("AI provider returned an empty response.");
      (err as any).code = "OPENROUTER_INVALID_RESPONSE";
      throw err;
    }

    try {
      const cleaned = this.cleanJsonString(content);
      return JSON.parse(cleaned);
    } catch {
      const err = new Error("AI generated malformed JSON. Validation failed.");
      (err as any).code = "OPENROUTER_INVALID_RESPONSE";
      throw err;
    }
  }

  async generatePOA(context: SanitizedStudentContext): Promise<SuggestedAction[]> {
    const system = `You are MENTOR OS AI, an expert aviation career advisor.
Generate 3 to 5 concrete, measurable action steps (milestones) for an aeronautical cadet.
Avoid vague objectives. Include success criteria.
Return JSON with key "actions" containing an array of objects with:
- title (string)
- category ('Licensing' | 'Academic' | 'Aviation English' | 'Interview' | 'Technical')
- priority ('LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')
- successCriteria (string)
- rationale (string)
- estimatedDaysToComplete (number)`;

    const user = `Student Profile:
Name: ${context.fullName}
Programme: ${context.programme} (${context.yearOfStudy}, Section ${context.section})
Target Goal: ${context.primaryCareerGoal}
Self/Mentor Assessed Skills: ${context.skills.map((s) => `${s.name}: ${s.rating}/5`).join(", ")}
Identified Strengths: ${context.strengths.join(", ") || "None recorded"}
Development Areas: ${context.developmentAreas.join(", ") || "None recorded"}
Stated Challenge: ${context.biggestChallenge || "None"}
Requested Mentor Help: ${context.mentorHelpNeeded || "None"}
Active Milestones: ${context.activeMilestones.map((m) => m.title).join(", ") || "None"}`;

    const res = await this.callOpenRouter(system, user);
    return res.actions || [];
  }

  async generateImprovementPlan(
    context: SanitizedStudentContext
  ): Promise<ImprovementPlanResult> {
    const system = `You are MENTOR OS AI. Analyze this aviation cadet and suggest a targeted improvement plan.
Return JSON with:
- summary (string, 2-3 sentences)
- focusAreas (array of strings)
- mentorActionableInputs (array of concrete actions for the mentor to support this cadet)
- recommendedMilestones (array of SuggestedAction objects)`;

    const user = JSON.stringify(context, null, 2);
    return await this.callOpenRouter(system, user);
  }

  async synthesizeCohort(
    summary: CohortSummaryPayload
  ): Promise<CohortSynthesisResult> {
    const system = `You are MENTOR OS AI. Provide an executive cohort-level analysis for the Chief Ground Instructor / Faculty Mentor.
Return JSON with:
- executiveSummary (string)
- cohortThemes (array of strings)
- highPriorityInterventions (array of strings)
- curriculumGaps (array of strings)`;

    const user = JSON.stringify(summary, null, 2);
    return await this.callOpenRouter(system, user);
  }
}
