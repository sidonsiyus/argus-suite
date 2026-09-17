import { SanitizedStudentContext, CopilotRecommendationItem } from "./types";

const FORBIDDEN_EVIDENCE_KEYWORDS = [
  "income",
  "salary",
  "family",
  "parent",
  "father",
  "mother",
  "gender",
  "blood",
  "medical",
  "allerg",
  "illness",
  "aadhaar",
  "phone",
  "mobile",
  "email",
  "credential",
  "password",
  "token",
  "secret",
  "emergency",
  "address",
];

/**
 * Validates that every recommendation contains grounded evidence that directly
 * cross-references real data present in the SanitizedStudentContext.
 * 
 * Rejects:
 * 1. Missing evidence.
 * 2. Fabricated evidence (source not in context).
 * 3. Nonexistent skills.
 * 4. Incorrect values (e.g. claiming a rating that does not match the cadet's record).
 * 5. Evidence referencing forbidden/sensitive data.
 */
export function validateEvidenceAgainstContext(
  recommendations: CopilotRecommendationItem[],
  context: SanitizedStudentContext
): void {
  if (!recommendations || recommendations.length === 0) {
    throw new Error("Validation failed: No recommendations provided.");
  }

  // Build lookup maps from the sanitized context
  const skillMap = new Map<string, number>();
  context.skills.forEach((s) => skillMap.set(s.name.toLowerCase().trim(), s.rating));

  const readinessMap = new Map<string, string>();
  Object.entries(context.readinessStates).forEach(([k, v]) =>
    readinessMap.set(k.toLowerCase().trim(), v.toLowerCase().trim())
  );

  const activeMilestoneTitles = new Set(
    context.activeMilestones.map((m) => m.title.toLowerCase().trim())
  );

  const historicalStrengths = new Set(
    context.strengths.map((s) => s.toLowerCase().trim())
  );
  const historicalDevAreas = new Set(
    context.developmentAreas.map((d) => d.toLowerCase().trim())
  );

  const primaryCareerGoalLower = context.primaryCareerGoal.toLowerCase().trim();

  for (const rec of recommendations) {
    if (!rec.evidence || !Array.isArray(rec.evidence) || rec.evidence.length === 0) {
      throw new Error(
        `Validation failed: Recommendation "${rec.title}" does not contain any evidence.`
      );
    }

    let hasAtLeastOneGroundedItem = false;

    for (const ev of rec.evidence) {
      const source = (ev.source || "").toLowerCase().trim();
      const value = (ev.value || "").toLowerCase().trim();

      if (!source || !value) {
        throw new Error(
          `Validation failed: Empty evidence source or value in recommendation "${rec.title}".`
        );
      }

      // Rule 5: Reject evidence referencing forbidden/sensitive information
      for (const forbidden of FORBIDDEN_EVIDENCE_KEYWORDS) {
        // Exception: Institutional readiness states "PAN Card" and "Aadhaar Card"
        if (
          (forbidden === "pan" && (source.includes("pan card") || value.includes("pan card"))) ||
          (forbidden === "aadhaar" && (source.includes("aadhaar card") || value.includes("aadhaar card")))
        ) {
          continue;
        }

        if (source.includes(forbidden) || value.includes(forbidden)) {
          throw new Error(
            `Validation failed: Evidence in recommendation "${rec.title}" references forbidden/sensitive information "${forbidden}".`
          );
        }
      }

      // Rule 3 & 4: Skill Grounding Validation
      if (source.includes("skill")) {
        // Find which known skill is being referenced
        let matchedSkillName: string | null = null;
        for (const skillName of Array.from(skillMap.keys())) {
          if (value.includes(skillName) || source.includes(skillName)) {
            matchedSkillName = skillName;
            break;
          }
        }

        if (!matchedSkillName) {
          throw new Error(
            `Validation failed: Evidence in recommendation "${rec.title}" cites nonexistent skill: "${ev.value}".`
          );
        }

        // Verify the rating cited matches the actual rating in context
        const actualRating = skillMap.get(matchedSkillName)!;
        // Check for rating patterns: "4", "4/5", "= 4", ": 4"
        const ratingMatch = value.match(/\b([1-5])(\/5)?\b/);
        if (ratingMatch) {
          const citedRating = parseInt(ratingMatch[1], 10);
          if (citedRating !== actualRating) {
            throw new Error(
              `Validation failed: Evidence in recommendation "${rec.title}" cites incorrect rating ${citedRating}/5 for "${matchedSkillName}" (actual rating is ${actualRating}/5).`
            );
          }
        }

        hasAtLeastOneGroundedItem = true;
      }
      // Readiness Grounding Validation
      else if (source.includes("readiness") || source.includes("credential")) {
        let matchedKey: string | null = null;
        for (const credKey of Array.from(readinessMap.keys())) {
          if (value.includes(credKey) || source.includes(credKey)) {
            matchedKey = credKey;
            break;
          }
        }

        if (!matchedKey) {
          throw new Error(
            `Validation failed: Evidence in recommendation "${rec.title}" cites nonexistent readiness credential: "${ev.value}".`
          );
        }

        const actualStatus = readinessMap.get(matchedKey)!;
        // If evidence explicitly cites a status (VERIFIED, NOT_REPORTED, AVAILABLE), verify it
        if (
          (value.includes("verified") && actualStatus !== "verified") ||
          (value.includes("available") && actualStatus !== "available") ||
          (value.includes("not_reported") && actualStatus !== "not_reported")
        ) {
          throw new Error(
            `Validation failed: Evidence in recommendation "${rec.title}" cites incorrect readiness status for "${matchedKey}" (actual status is ${actualStatus}).`
          );
        }

        hasAtLeastOneGroundedItem = true;
      }
      // Career Goal Grounding Validation
      else if (source.includes("career") || source.includes("goal")) {
        if (!value.includes(primaryCareerGoalLower) && !primaryCareerGoalLower.includes(value)) {
          // Check career prerequisites
          const matchesPrereq = context.careerPrerequisites.some((p) =>
            value.includes(p.toLowerCase().trim())
          );
          if (!matchesPrereq) {
            throw new Error(
              `Validation failed: Evidence in recommendation "${rec.title}" cites unsupported career goal/prerequisite: "${ev.value}".`
            );
          }
        }
        hasAtLeastOneGroundedItem = true;
      }
      // Milestones Grounding Validation
      else if (source.includes("milestone") || source.includes("action plan")) {
        let matchedMilestone = false;
        for (const mTitle of Array.from(activeMilestoneTitles)) {
          if (value.includes(mTitle) || mTitle.includes(value)) {
            matchedMilestone = true;
            break;
          }
        }
        if (!matchedMilestone && activeMilestoneTitles.size > 0) {
          throw new Error(
            `Validation failed: Evidence in recommendation "${rec.title}" cites unrecorded milestone: "${ev.value}".`
          );
        }
        hasAtLeastOneGroundedItem = true;
      }
      // Historical Profile Grounding Validation
      else if (source.includes("historical") || source.includes("profile") || source.includes("strength") || source.includes("weakness") || source.includes("development")) {
        let matchedHistorical = false;
        for (const s of Array.from(historicalStrengths)) {
          if (value.includes(s) || s.includes(value)) {
            matchedHistorical = true;
            break;
          }
        }
        for (const d of Array.from(historicalDevAreas)) {
          if (value.includes(d) || d.includes(value)) {
            matchedHistorical = true;
            break;
          }
        }
        if (context.biggestChallenge && value.includes(context.biggestChallenge.toLowerCase().trim())) {
          matchedHistorical = true;
        }
        if (context.mentorHelpNeeded && value.includes(context.mentorHelpNeeded.toLowerCase().trim())) {
          matchedHistorical = true;
        }

        if (!matchedHistorical) {
          throw new Error(
            `Validation failed: Evidence in recommendation "${rec.title}" cites unrecorded historical baseline item: "${ev.value}".`
          );
        }
        hasAtLeastOneGroundedItem = true;
      }
      // Academic / Cohort Grounding Validation
      else if (source.includes("academic") || source.includes("programme") || source.includes("cohort")) {
        hasAtLeastOneGroundedItem = true;
      } else {
        // Unknown / Fabricated Source
        throw new Error(
          `Validation failed: Evidence in recommendation "${rec.title}" cites unsupported/unrecognized source category "${ev.source}".`
        );
      }
    }

    if (!hasAtLeastOneGroundedItem) {
      throw new Error(
        `Validation failed: Recommendation "${rec.title}" has no verifiable grounded evidence item.`
      );
    }
  }
}
