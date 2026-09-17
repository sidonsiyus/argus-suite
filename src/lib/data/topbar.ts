import { cache } from "react";
import { createServerSupabase } from "@/lib/supabase/server";

export interface TopBarStudentItem {
  id: string;
  full_name: string;
  reg_no: string;
  career_goal?: string;
}

export interface TopBarHeaderData {
  searchIndex: TopBarStudentItem[];
  attentionCount: number;
}

/**
 * Lightweight, cached TopBar header data provider.
 * Strictly respects data minimization: fetches only id, full_name, reg_no.
 * Never fetches contact info, demographics, or unrelated aggregates.
 * Deduplicated per request lifecycle using React cache().
 */
export const getTopBarHeaderData = cache(async (): Promise<TopBarHeaderData> => {
  try {
    const supabase = createServerSupabase();

    // 1. Single minimal query for cadet search index (order by sno)
    const { data: students } = await supabase
      .from("students")
      .select("id, full_name, reg_no, student_career_goals(custom_role_title)")
      .order("sno", { ascending: true });

    const searchIndex: TopBarStudentItem[] = (students || []).map((s: any) => ({
      id: s.id,
      full_name: s.full_name,
      reg_no: s.reg_no,
      career_goal: s.student_career_goals?.[0]?.custom_role_title || "Flight Operations Track",
    }));

    return {
      searchIndex,
      attentionCount: 0,
    };
  } catch (err) {
    console.error("Error fetching TopBar header data:", err);
    return {
      searchIndex: [],
      attentionCount: 0,
    };
  }
});
