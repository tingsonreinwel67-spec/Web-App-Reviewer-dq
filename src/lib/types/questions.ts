import { ExamType } from "./common";

export interface Choice {
  id: string;
  text: string;
  is_correct: boolean;
}

export interface Question {
  id: string;
  exam_type: ExamType;
  category: string;
  text: string;
  explanation: string | null;
  difficulty: number;
  created_at: string;
  choices: Choice[];
}
