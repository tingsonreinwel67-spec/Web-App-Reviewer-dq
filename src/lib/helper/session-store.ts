import pool from "@/lib/db";
import type { SavedSession } from "@/lib/helper/study-session";
import type { StudyMode } from "@/lib/types/study";

/**
 * Persisted deck position for one learner, track and study mode. One row per
 * combination, replaced on every answer, deleted when the deck is finished or
 * restarted.
 */
export async function loadSession(
  userId: string,
  examType: string,
  mode: StudyMode,
): Promise<SavedSession | null> {
  const result = await pool.query(
    `SELECT card_order, card_index, ratings FROM study_sessions
     WHERE user_id = $1 AND exam_type = $2 AND mode = $3`,
    [userId, examType, mode],
  );

  const row = result.rows[0];
  if (!row) return null;

  return {
    card_order: Array.isArray(row.card_order) ? row.card_order : [],
    card_index: Number(row.card_index) || 0,
    ratings: row.ratings && typeof row.ratings === "object" ? row.ratings : {},
  };
}

export async function saveSession(
  userId: string,
  examType: string,
  mode: StudyMode,
  session: SavedSession,
): Promise<void> {
  await pool.query(
    `INSERT INTO study_sessions
       (user_id, exam_type, mode, card_order, card_index, ratings, updated_at)
     VALUES ($1, $2, $3, $4::jsonb, $5, $6::jsonb, now())
     ON CONFLICT (user_id, exam_type, mode) DO UPDATE SET
       card_order = EXCLUDED.card_order,
       card_index = EXCLUDED.card_index,
       ratings    = EXCLUDED.ratings,
       updated_at = now()`,
    [
      userId,
      examType,
      mode,
      JSON.stringify(session.card_order),
      session.card_index,
      JSON.stringify(session.ratings),
    ],
  );
}

export async function clearSession(
  userId: string,
  examType: string,
  mode: StudyMode,
): Promise<void> {
  await pool.query(
    `DELETE FROM study_sessions
     WHERE user_id = $1 AND exam_type = $2 AND mode = $3`,
    [userId, examType, mode],
  );
}
