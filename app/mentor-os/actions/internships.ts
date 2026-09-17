"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  executeCreateOpportunity,
  executeUpdateOpportunity,
  executeArchiveOpportunity,
  executeRecordStudentInternship,
  executeUpdateStudentInternshipStatus,
  executeUpdateStudentInternship,
  executeAttachCompletionDocument,
  executeDeleteStudentInternship,
} from "@/lib/data/internships";
import { WorkMode, InternshipStatus } from "@/lib/internships/types";

const OpportunityInputSchema = z.object({
  organization: z.string().trim().min(2, "Organization name must be at least 2 characters.").max(150),
  title: z.string().trim().min(2, "Title must be at least 2 characters.").max(200),
  location: z.string().trim().max(150).optional(),
  work_mode: z.enum(["ON_SITE", "REMOTE", "HYBRID"]).default("ON_SITE"),
  description: z.string().trim().max(3000).optional(),
  requirements: z.string().trim().max(2000).optional(),
  application_deadline: z.string().trim().optional(),
  application_url: z.string().trim().url("Must be a valid URL").optional().or(z.literal("")),
});

const StudentInternshipInputSchema = z.object({
  opportunity_id: z.string().uuid().optional().or(z.literal("")),
  organization: z.string().trim().max(150).optional(),
  role_description: z.string().trim().max(200).optional(),
  status: z
    .enum(["SAVED", "RECOMMENDED", "APPLIED", "INTERVIEW", "SELECTED", "REJECTED", "COMPLETED"])
    .default("APPLIED"),
  applied_date: z.string().trim().optional(),
  start_date: z.string().trim().optional(),
  end_date: z.string().trim().optional(),
  mentor_notes: z.string().trim().max(2000).optional(),
  certificate_doc_id: z.string().uuid().optional().or(z.literal("")),
});

// 1. Create Opportunity
export async function createOpportunityAction(formData: {
  organization: string;
  title: string;
  location?: string;
  work_mode?: WorkMode;
  description?: string;
  requirements?: string;
  application_deadline?: string;
  application_url?: string;
}) {
  try {
    const validated = OpportunityInputSchema.parse(formData);

    const res = await executeCreateOpportunity({
      organization: validated.organization,
      title: validated.title,
      location: validated.location,
      work_mode: validated.work_mode,
      description: validated.description,
      requirements: validated.requirements,
      application_deadline: validated.application_deadline || undefined,
      application_url: validated.application_url || undefined,
    });

    if (res.success) {
      revalidatePath("/internships");
    }

    return res;
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0]?.message || "Invalid input." };
    }
    console.error("Error in createOpportunityAction:", err);
    return {
      success: false,
      error: err?.message && err.message.includes("Unauthorized")
        ? "Unauthorized. Faculty credentials required."
        : "Failed to create opportunity.",
    };
  }
}

// 2. Update Opportunity
export async function updateOpportunityAction(
  id: string,
  formData: {
    organization: string;
    title: string;
    location?: string;
    work_mode?: WorkMode;
    description?: string;
    requirements?: string;
    application_deadline?: string;
    application_url?: string;
  }
) {
  try {
    if (!id) return { success: false, error: "Opportunity ID is required." };

    const validated = OpportunityInputSchema.parse(formData);

    const res = await executeUpdateOpportunity(id, {
      organization: validated.organization,
      title: validated.title,
      location: validated.location,
      work_mode: validated.work_mode,
      description: validated.description,
      requirements: validated.requirements,
      application_deadline: validated.application_deadline || undefined,
      application_url: validated.application_url || undefined,
    });

    if (res.success) {
      revalidatePath("/internships");
    }

    return res;
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0]?.message || "Invalid input." };
    }
    console.error("Error in updateOpportunityAction:", err);
    return {
      success: false,
      error: err?.message && err.message.includes("Unauthorized")
        ? "Unauthorized. Faculty credentials required."
        : "Failed to update opportunity.",
    };
  }
}

// 3. Archive / Restore Opportunity
export async function archiveOpportunityAction(id: string, isActive: boolean) {
  try {
    if (!id) return { success: false, error: "Opportunity ID is required." };

    const res = await executeArchiveOpportunity(id, isActive);
    if (res.success) {
      revalidatePath("/internships");
    }
    return res;
  } catch (err: any) {
    console.error("Error in archiveOpportunityAction:", err);
    return {
      success: false,
      error: err?.message && err.message.includes("Unauthorized")
        ? "Unauthorized. Faculty credentials required."
        : "Failed to update opportunity archive status.",
    };
  }
}

// 4. Record Student Internship (From Catalogue or External)
export async function recordStudentInternshipAction(
  studentId: string,
  formData: {
    opportunity_id?: string | null;
    organization?: string;
    role_description?: string;
    status?: InternshipStatus;
    applied_date?: string;
    start_date?: string;
    end_date?: string;
    mentor_notes?: string;
    certificate_doc_id?: string;
  }
) {
  try {
    if (!studentId) return { success: false, error: "Student ID is required." };

    const validated = StudentInternshipInputSchema.parse(formData);

    if (!validated.opportunity_id && !validated.organization) {
      return {
        success: false,
        error: "Organization is required for externally sourced internships.",
      };
    }

    const res = await executeRecordStudentInternship(studentId, {
      opportunity_id: validated.opportunity_id || null,
      organization: validated.organization,
      role_description: validated.role_description,
      status: validated.status,
      applied_date: validated.applied_date,
      start_date: validated.start_date,
      end_date: validated.end_date,
      mentor_notes: validated.mentor_notes,
      certificate_doc_id: validated.certificate_doc_id || undefined,
    });

    if (res.success) {
      revalidatePath("/internships");
      revalidatePath(`/students/${studentId}`);
    }

    return res;
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0]?.message || "Invalid input." };
    }
    console.error("Error in recordStudentInternshipAction:", err);
    return {
      success: false,
      error: err?.message && err.message.includes("Unauthorized")
        ? "Unauthorized. Faculty credentials required."
        : "Failed to record student internship.",
    };
  }
}

// 5. Update Status (Controlled State Transitions)
export async function updateStudentInternshipStatusAction(
  internshipId: string,
  studentId: string,
  targetStatus: InternshipStatus,
  notes?: string
) {
  try {
    if (!internshipId) return { success: false, error: "Internship ID is required." };

    const res = await executeUpdateStudentInternshipStatus(internshipId, targetStatus, notes);

    if (res.success) {
      revalidatePath("/internships");
      if (studentId) revalidatePath(`/students/${studentId}`);
    }

    return res;
  } catch (err: any) {
    console.error("Error in updateStudentInternshipStatusAction:", err);
    return {
      success: false,
      error: err?.message && err.message.includes("Unauthorized")
        ? "Unauthorized. Faculty credentials required."
        : "Failed to update internship status.",
    };
  }
}

// 6. Update Student Internship Details
export async function updateStudentInternshipAction(
  internshipId: string,
  studentId: string,
  formData: {
    organization?: string;
    role_description?: string;
    applied_date?: string;
    start_date?: string;
    end_date?: string;
    mentor_notes?: string;
    certificate_doc_id?: string;
  }
) {
  try {
    if (!internshipId) return { success: false, error: "Internship ID is required." };

    const res = await executeUpdateStudentInternship(internshipId, formData);

    if (res.success) {
      revalidatePath("/internships");
      if (studentId) revalidatePath(`/students/${studentId}`);
    }

    return res;
  } catch (err: any) {
    console.error("Error in updateStudentInternshipAction:", err);
    return {
      success: false,
      error: err?.message && err.message.includes("Unauthorized")
        ? "Unauthorized. Faculty credentials required."
        : "Failed to update internship details.",
    };
  }
}

// 7. Attach Completion Certificate
export async function attachInternshipDocumentAction(
  internshipId: string,
  studentId: string,
  documentId: string
) {
  try {
    if (!internshipId || !documentId) {
      return { success: false, error: "Internship ID and Document ID are required." };
    }

    const res = await executeAttachCompletionDocument(internshipId, documentId);

    if (res.success) {
      revalidatePath("/internships");
      if (studentId) revalidatePath(`/students/${studentId}`);
    }

    return res;
  } catch (err: any) {
    console.error("Error in attachInternshipDocumentAction:", err);
    return {
      success: false,
      error: err?.message && err.message.includes("Unauthorized")
        ? "Unauthorized. Faculty credentials required."
        : "Failed to attach certificate.",
    };
  }
}

// 8. Delete Student Internship
export async function deleteStudentInternshipAction(
  internshipId: string,
  studentId: string
) {
  try {
    if (!internshipId) return { success: false, error: "Internship ID is required." };

    const res = await executeDeleteStudentInternship(internshipId);

    if (res.success) {
      revalidatePath("/internships");
      if (studentId) revalidatePath(`/students/${studentId}`);
    }

    return res;
  } catch (err: any) {
    console.error("Error in deleteStudentInternshipAction:", err);
    return {
      success: false,
      error: err?.message && err.message.includes("Unauthorized")
        ? "Unauthorized. Faculty credentials required."
        : "Failed to delete internship record.",
    };
  }
}
