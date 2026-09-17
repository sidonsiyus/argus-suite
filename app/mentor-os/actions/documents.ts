"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import crypto from "node:crypto";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  StudentDocumentItem,
  DocumentFilters,
  ALL_DOCUMENT_CATEGORIES,
} from "@/lib/documents/types";
import { getStudentDocuments } from "@/lib/data/documents";

// ---------------------------------------------------------------------------
// 1. Authoritative Faculty Resolver
// ---------------------------------------------------------------------------
async function getAuthenticatedFaculty() {
  const supabase = createServerSupabase();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    throw new Error("Unauthorized: Faculty mentor authentication required.");
  }

  const { data: isFaculty, error: roleError } = await supabase.rpc("is_faculty");
  if (roleError || !isFaculty) {
    throw new Error("Forbidden: Faculty mentor access required.");
  }

  return { supabase, user };
}

// Allowed MIME types: PDF, DOC, DOCX
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

// ---------------------------------------------------------------------------
// 2. Upload Document Server Action
// ---------------------------------------------------------------------------
export async function uploadStudentDocumentAction(formData: FormData) {
  try {
    const { supabase, user } = await getAuthenticatedFaculty();

    const file = formData.get("file") as File | null;
    const studentId = formData.get("studentId") as string | null;
    const title = formData.get("title") as string | null;
    const category = formData.get("category") as string | null;
    const description = formData.get("description") as string | null;
    const internshipId = formData.get("internshipId") as string | null;
    const milestoneId = formData.get("milestoneId") as string | null;

    if (!file || !studentId || !title?.trim() || !category) {
      return { success: false, error: "File, title, category, and cadet ID are required." };
    }

    // 1. File size check
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return { success: false, error: "File size exceeds maximum allowed limit (10 MB)." };
    }

    // 2. MIME type check
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return { success: false, error: "Only PDF, DOC, and DOCX documents are supported." };
    }

    // 3. Verify category is allowed
    const validCategory = ALL_DOCUMENT_CATEGORIES.some((c) => c.value === category);
    if (!validCategory) {
      return { success: false, error: `Invalid document category: "${category}".` };
    }

    // 4. Verify cadet exists
    const { data: student, error: sErr } = await supabase
      .from("students")
      .select("id, reg_no, full_name")
      .eq("id", studentId)
      .single();

    if (sErr || !student) {
      return { success: false, error: "Cadet record not found." };
    }

    // 5. If internshipId supplied, verify it belongs strictly to this student
    if (internshipId) {
      const { data: internship, error: intErr } = await supabase
        .from("internships")
        .select("id, student_id, organization")
        .eq("id", internshipId)
        .eq("student_id", studentId)
        .maybeSingle();

      if (intErr || !internship) {
        return {
          success: false,
          error: "Unauthorized: Selected internship does not belong to this cadet.",
        };
      }
    }

    // 6. If milestoneId supplied, verify it belongs strictly to this student and is non-historical
    if (milestoneId) {
      const { data: milestone, error: mileErr } = await supabase
        .from("milestones")
        .select("id, student_id, title, provenance, category")
        .eq("id", milestoneId)
        .eq("student_id", studentId)
        .maybeSingle();

      if (mileErr || !milestone) {
        return {
          success: false,
          error: "Unauthorized: Selected milestone does not belong to this cadet.",
        };
      }

      if (milestone.provenance === "HISTORICAL_PROFILE" || milestone.category === "Action Plan") {
        return {
          success: false,
          error: "Historical baseline milestones cannot be associated with new documents.",
        };
      }
    }

    // 7. Generate safe storage path: students/{studentId}/documents/{docId}/{safeFilename}
    const documentId = crypto.randomUUID();
    const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `students/${studentId}/documents/${documentId}/${safeFilename}`;

    const fileBuffer = await file.arrayBuffer();

    // 8. Upload to private Supabase Storage
    const { error: uploadErr } = await supabase.storage
      .from("student-documents")
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadErr) {
      console.error("Storage upload error:", uploadErr);
      return { success: false, error: "Failed to upload document to secure storage." };
    }

    // 9. Insert metadata record into public.student_documents
    const now = new Date().toISOString();
    const docPayload: any = {
      id: documentId,
      student_id: studentId,
      title: title.trim(),
      category,
      description: description?.trim() || null,
      storage_path: storagePath,
      file_size_bytes: file.size,
      mime_type: file.type,
      is_verified: true,
      verified_by: user.id,
      verified_at: now,
      uploaded_by: user.id,
      uploaded_at: now,
      internship_id: internshipId || null,
      milestone_id: milestoneId || null,
    };

    const { data: docRow, error: docErr } = await supabase
      .from("student_documents")
      .insert(docPayload)
      .select("id")
      .single();

    if (docErr || !docRow) {
      console.error("Document metadata insert error:", docErr);
      // Clean up uploaded storage object if database insert failed
      await supabase.storage.from("student-documents").remove([storagePath]);
      return { success: false, error: "Failed to record document metadata in database: " + docErr?.message };
    }

    // 10. Backward compatibility links
    if (milestoneId) {
      await supabase
        .from("milestones")
        .update({
          evidence_doc_id: documentId,
          evidence_submitted_at: now,
        })
        .eq("id", milestoneId)
        .eq("student_id", studentId);
    }

    if (
      internshipId &&
      (category === "INTERNSHIP_COMPLETION_CERTIFICATE" || category === "INTERNSHIP_CERTIFICATE")
    ) {
      await supabase
        .from("internships")
        .update({
          certificate_doc_id: documentId,
        })
        .eq("id", internshipId)
        .eq("student_id", studentId);
    }

    // 11. Audit Log (Preserves full upload context)
    await supabase.from("audit_logs").insert({
      entity_table: "student_documents",
      entity_id: documentId,
      action: "INSERT",
      actor_id: user.id,
      actor_role: "faculty",
      new_values: {
        document_id: documentId,
        title: title.trim(),
        category,
        description: description?.trim() || null,
        storage_path: storagePath,
        file_size_bytes: file.size,
        mime_type: file.type,
        student_id: studentId,
        internship_id: internshipId || null,
        milestone_id: milestoneId || null,
      },
    });

    revalidatePath(`/students/${studentId}`, "page");
    revalidatePath(`/students/${studentId}`);
    revalidatePath("/internships");

    // Fetch freshly created document item to return immediately to UI
    const docs = await getStudentDocuments(studentId);
    const createdDoc = docs.find((d) => d.id === documentId) || null;

    return { success: true, docId: documentId, document: createdDoc };
  } catch (err: any) {
    console.error("uploadStudentDocumentAction error:", err);
    return {
      success: false,
      error: err?.message && err.message.includes("Unauthorized")
        ? "Unauthorized. Faculty mentor credentials required."
        : err?.message || "Failed to upload document.",
    };
  }
}

// ---------------------------------------------------------------------------
// 3. Delete Document Server Action
// ---------------------------------------------------------------------------
export async function deleteStudentDocumentAction(input: {
  documentId: string;
  studentId: string;
}) {
  try {
    const { supabase, user } = await getAuthenticatedFaculty();

    const { documentId, studentId } = input;
    if (!documentId || !studentId) {
      return { success: false, error: "Document ID and cadet ID are required." };
    }

    // 1. Fetch current document record to verify ownership and retrieve storage_path
    const { data: doc, error: docErr } = await supabase
      .from("student_documents")
      .select("*")
      .eq("id", documentId)
      .eq("student_id", studentId)
      .single();

    if (docErr || !doc) {
      return { success: false, error: "Document not found or access restricted." };
    }

    // 2. Pre-record audit log snapshot before deletion
    const now = new Date().toISOString();
    await supabase.from("audit_logs").insert({
      entity_table: "student_documents",
      entity_id: documentId,
      action: "DELETE",
      actor_id: user.id,
      actor_role: "faculty",
      old_values: {
        id: doc.id,
        student_id: doc.student_id,
        title: doc.title,
        category: doc.category,
        storage_path: doc.storage_path,
        file_size_bytes: doc.file_size_bytes,
        internship_id: doc.internship_id,
        milestone_id: doc.milestone_id,
      },
      new_values: {
        action: "DOCUMENT_DELETE",
        deleted_by: user.id,
        deleted_at: now,
      },
    });

    // 3. Clear any foreign key pointers pointing to this document
    if (doc.internship_id) {
      await supabase
        .from("internships")
        .update({ certificate_doc_id: null })
        .eq("certificate_doc_id", documentId);
    }

    if (doc.milestone_id) {
      await supabase
        .from("milestones")
        .update({ evidence_doc_id: null })
        .eq("evidence_doc_id", documentId);
    }

    // 4. Delete storage file
    if (doc.storage_path) {
      const { error: storageDelErr } = await supabase.storage
        .from("student-documents")
        .remove([doc.storage_path]);

      if (storageDelErr) {
        console.warn("Storage deletion warning (file may have already been removed):", storageDelErr);
      }
    }

    // 5. Delete database record
    const { error: dbDelErr } = await supabase
      .from("student_documents")
      .delete()
      .eq("id", documentId)
      .eq("student_id", studentId);

    if (dbDelErr) {
      console.error("Database document delete error:", dbDelErr);
      return { success: false, error: "Failed to delete document record from database." };
    }

    revalidatePath(`/students/${studentId}`);
    revalidatePath("/internships");

    return { success: true };
  } catch (err: any) {
    console.error("deleteStudentDocumentAction error:", err);
    return {
      success: false,
      error: err?.message || "Failed to delete document.",
    };
  }
}

// ---------------------------------------------------------------------------
// 4. Fetch Student Documents Action
// ---------------------------------------------------------------------------
export async function getStudentDocumentsAction(
  studentId: string,
  filters?: DocumentFilters
) {
  try {
    if (!studentId) {
      return { success: false, error: "Cadet ID is required.", documents: [] };
    }

    const documents = await getStudentDocuments(studentId, filters);
    return { success: true, documents };
  } catch (err: any) {
    console.error("getStudentDocumentsAction error:", err);
    return { success: false, error: err?.message || "Failed to load documents.", documents: [] };
  }
}

// ---------------------------------------------------------------------------
// 5. Generate Signed View / Download URL Action
// ---------------------------------------------------------------------------
export async function getDocumentViewUrlAction(
  documentId: string,
  studentId: string,
  download = false
) {
  try {
    const { supabase } = await getAuthenticatedFaculty();

    if (!documentId || !studentId) {
      return { success: false, error: "Document ID and cadet ID required." };
    }

    // Verify document belongs to student
    const { data: doc, error: docErr } = await supabase
      .from("student_documents")
      .select("id, title, storage_path, mime_type")
      .eq("id", documentId)
      .eq("student_id", studentId)
      .single();

    if (docErr || !doc) {
      return { success: false, error: "Document not found or unauthorized." };
    }

    // Create 5-minute (300 seconds) short-lived signed URL
    const { data, error: signErr } = await supabase.storage
      .from("student-documents")
      .createSignedUrl(doc.storage_path, 300, {
        download: download ? doc.title : false,
      });

    if (signErr || !data?.signedUrl) {
      console.error("createSignedUrl error:", signErr);
      return { success: false, error: "Failed to generate secure document access URL." };
    }

    return {
      success: true,
      signedUrl: data.signedUrl,
      title: doc.title,
      mimeType: doc.mime_type,
    };
  } catch (err: any) {
    console.error("getDocumentViewUrlAction error:", err);
    return { success: false, error: err?.message || "Failed to generate secure URL." };
  }
}

// Backward-compatible alias
export const uploadMentorDocumentAction = uploadStudentDocumentAction;
