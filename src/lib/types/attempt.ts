import type { ExamType } from "./common";

export interface ExamAttempt {
  id: string;
  user_id: string;
  exam_type: ExamType;
  score: number;
  total_items: number;
  passed: boolean;
  started_at: string;
  completed_at: string | null;
}

export interface ExamAttemptAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_choice_id: string | null;
  is_correct: boolean;
}

export interface UserProgress {
  id: string;
  user_id: string;
  exam_type: ExamType;
  flashcards_done: number;
  vocab_done: number;
  pass_count: number;
  updated_at: string;
}

export interface QuestionProgress {
  id: string;
  user_id: string;
  question_id: string;
  selected_choice_id: string | null;
  is_correct: boolean;
  times_seen: number;
  times_correct: number;
  mastered: boolean;
  last_reviewed_at: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  exam_type: ExamType;
  issued_at: string;
  certificate_no: string;
}
