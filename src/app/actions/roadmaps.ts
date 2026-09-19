"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { executeSetRoadmapStage } from "@/lib/data/roadmaps";

const SetStageSchema = z.object({
  studentId: z.string().uuid("Invalid cadet id"),
  trackSlug: z.string().min(1).max(64),
  stageKey: z.string().min(1).max(64),
});

export async function setStudentRoadmapStageAction(raw: {
  studentId: string;
  trackSlug: string;
  stageKey: string;
}) {
  try {
    const v = SetStageSchema.parse(raw);
    const res = await executeSetRoadmapStage(v.studentId, v.trackSlug, v.stageKey);
    if (!res.success) return { success: false, error: res.error || "Failed to update stage." };
    revalidatePath("/mentor-os/roadmaps");
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to update stage." };
  }
}
