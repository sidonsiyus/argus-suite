-- ==========================================================================
-- MENTOR OS: Phase 2 Atomic AI Approval RPC Migration
-- Migration: 20260916_approve_ai_recommendation_atomic.sql
-- ==========================================================================

CREATE OR REPLACE FUNCTION public.approve_ai_recommendation_atomic(
    p_rec_id UUID,
    p_student_id UUID,
    p_action_type TEXT, -- 'APPROVE', 'EDIT_AND_APPROVE', 'REJECT'
    p_edits JSONB DEFAULT NULL,
    p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_actor_id UUID;
    v_rec RECORD;
    v_milestone_id UUID := NULL;
    v_action JSONB;
    v_title TEXT;
    v_priority milestone_priority;
    v_criteria TEXT;
    v_new_status ai_rec_status;
BEGIN
    -- 1. Server-derived authenticated identity
    v_actor_id := auth.uid();
    IF v_actor_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: Authentication required';
    END IF;

    -- 2. Authorization check: must be faculty or admin
    IF NOT public.is_faculty() THEN
        RAISE EXCEPTION 'Unauthorized: Faculty or admin role required';
    END IF;

    -- 3. Row-level write lock (FOR UPDATE) - prevents concurrent double-approvals
    SELECT * INTO v_rec
    FROM public.ai_recommendations
    WHERE id = p_rec_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Recommendation not found';
    END IF;

    IF v_rec.student_id <> p_student_id THEN
        RAISE EXCEPTION 'Recommendation does not belong to specified cadet';
    END IF;

    IF v_rec.status <> 'PENDING' THEN
        RAISE EXCEPTION 'Recommendation is not in PENDING state (current status: %)', v_rec.status;
    END IF;

    v_action := v_rec.suggested_actions;

    -- 4. Branch by requested action
    IF p_action_type = 'APPROVE' THEN
        v_new_status := 'APPROVED';

        -- If type is MILESTONE, create permanent record with AI_GENERATED provenance
        IF (v_action->>'type') = 'MILESTONE' THEN
            v_priority := CASE 
                WHEN (v_action->>'priority') IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') 
                THEN (v_action->>'priority')::milestone_priority 
                ELSE 'MEDIUM'::milestone_priority 
            END;

            INSERT INTO public.milestones (
                student_id,
                title,
                description,
                category,
                priority,
                status,
                success_criteria,
                is_ai_suggested,
                ai_recommendation_id,
                created_by,
                provenance
            ) VALUES (
                p_student_id,
                v_action->>'title',
                v_action->>'rationale',
                'Aviation Career Development',
                v_priority,
                'ACTIVE',
                COALESCE(v_action->>'suggested_action', 'Completion of milestone requirements'),
                true,
                p_rec_id,
                v_actor_id,
                'AI_GENERATED'
            ) RETURNING id INTO v_milestone_id;
        END IF;

        -- Update recommendation atomically
        UPDATE public.ai_recommendations
        SET status = 'APPROVED',
            reviewed_by = v_actor_id,
            reviewed_at = now()
        WHERE id = p_rec_id;

        -- Record audit log atomically
        INSERT INTO public.audit_logs (
            entity_table,
            entity_id,
            action,
            actor_id,
            actor_role,
            new_values
        ) VALUES (
            'ai_recommendations',
            p_rec_id,
            'APPROVE_AI',
            v_actor_id,
            'faculty',
            jsonb_build_object(
                'status', 'APPROVED',
                'milestone_id', v_milestone_id,
                'student_id', p_student_id,
                'type', v_action->>'type'
            )
        );

    ELSIF p_action_type = 'EDIT_AND_APPROVE' THEN
        v_new_status := 'EDITED';
        v_title := TRIM(COALESCE(p_edits->>'title', v_action->>'title'));
        v_criteria := TRIM(COALESCE(p_edits->>'suggested_action', v_action->>'suggested_action'));
        v_priority := CASE 
            WHEN (p_edits->>'priority') IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') 
            THEN (p_edits->>'priority')::milestone_priority 
            ELSE 'MEDIUM'::milestone_priority 
        END;

        IF (v_action->>'type') = 'MILESTONE' THEN
            INSERT INTO public.milestones (
                student_id,
                title,
                description,
                category,
                priority,
                status,
                success_criteria,
                is_ai_suggested,
                ai_recommendation_id,
                created_by,
                provenance,
                mentor_feedback
            ) VALUES (
                p_student_id,
                v_title,
                'Mentor-refined milestone. Original AI rationale: ' || COALESCE(v_action->>'rationale', ''),
                'Aviation Career Development',
                v_priority,
                'ACTIVE',
                v_criteria,
                true,
                p_rec_id,
                v_actor_id,
                'MENTOR_ENTERED',
                CASE WHEN p_edits->>'review_notes' IS NOT NULL AND p_edits->>'review_notes' <> '' 
                     THEN 'Mentor Notes: ' || (p_edits->>'review_notes') 
                     ELSE NULL 
                END
            ) RETURNING id INTO v_milestone_id;
        END IF;

        UPDATE public.ai_recommendations
        SET status = 'EDITED',
            reviewed_by = v_actor_id,
            reviewed_at = now(),
            review_notes = p_edits->>'review_notes',
            suggested_actions = jsonb_set(
                jsonb_set(
                    jsonb_set(v_action, '{title}', to_jsonb(v_title)),
                    '{suggested_action}', to_jsonb(v_criteria)
                ),
                '{priority}', to_jsonb(v_priority::text)
            )
        WHERE id = p_rec_id;

        INSERT INTO public.audit_logs (
            entity_table,
            entity_id,
            action,
            actor_id,
            actor_role,
            old_values,
            new_values
        ) VALUES (
            'ai_recommendations',
            p_rec_id,
            'UPDATE',
            v_actor_id,
            'faculty',
            jsonb_build_object('status', 'PENDING'),
            jsonb_build_object(
                'status', 'EDITED',
                'title', v_title,
                'milestone_id', v_milestone_id,
                'student_id', p_student_id
            )
        );

    ELSIF p_action_type = 'REJECT' THEN
        v_new_status := 'REJECTED';

        UPDATE public.ai_recommendations
        SET status = 'REJECTED',
            reviewed_by = v_actor_id,
            reviewed_at = now(),
            review_notes = COALESCE(p_reason, 'Rejected by mentor')
        WHERE id = p_rec_id;

        INSERT INTO public.audit_logs (
            entity_table,
            entity_id,
            action,
            actor_id,
            actor_role,
            old_values,
            new_values
        ) VALUES (
            'ai_recommendations',
            p_rec_id,
            'UPDATE',
            v_actor_id,
            'faculty',
            jsonb_build_object('status', 'PENDING'),
            jsonb_build_object(
                'status', 'REJECTED',
                'reason', p_reason,
                'student_id', p_student_id
            )
        );
    ELSE
        RAISE EXCEPTION 'Invalid action type: %', p_action_type;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'status', v_new_status::text,
        'milestone_id', v_milestone_id
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.approve_ai_recommendation_atomic(UUID, UUID, TEXT, JSONB, TEXT) TO authenticated;
