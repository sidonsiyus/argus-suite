"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { executeRecordSkillAssessments } from "@/lib/data/skills";

const SkillUpdateSchema = z.object({
  skillId: z.string().uuid("Invalid skill id"),
  rating: z.number().int().min(1).max(5),
  note: z.string().trim().max(500).optional(),
});

const RecordSchema = z.object({
  studentId: z.string().uuid("Invalid cadet id"),
  sessionId: z.string().uuid().optional().nullable(),
  updates: z.array(SkillUpdateSchema).min(1, "Select at least one skill to update"),
});

export async function recordSkillProgressAction(raw: {
  studentId: string;
  sessionId?: string | null;
  updates: Array<{ skillId: string; rating: number; note?: string }>;
}) {
  try {
    const validated = RecordSchema.parse(raw);
    const res = await executeRecordSkillAssessments(
      validated.studentId,
      validated.sessionId || null,
      validated.updates.map((u) => ({ skillId: u.skillId!, rating: u.rating!, note: u.note }))
    );
    if (!res.success) {
      return { success: false, error: res.error || "Failed to save skill updates." };
    }

    revalidatePath(`/mentor-os/students/${validated.studentId}`);
    revalidatePath(`/mentor-os/analytics/${validated.studentId}`);
    revalidatePath("/mentor-os/analytics");

    return { success: true, inserted: res.inserted, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to save skill updates." };
  }
}
