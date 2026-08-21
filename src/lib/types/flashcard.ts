import { ExamType } from "./common";

export interface Flashcard {
  id: string;
  exam_type: ExamType;
  category: string;
  front: string;
  back: string;
}

export interface FlashcardProgress {
  id: string;
  user_id: string;
  flashcard_id: string;
  reviewed_at: string;
  mastered: boolean;
}
