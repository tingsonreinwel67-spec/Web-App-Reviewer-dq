export type ExamType = 'vul' | 'traditional'

export type Answer = {
  id: string
  text: string
  correct?: boolean
}

export type Question = {
  id: number
  section: string
  prompt: string
  answers: Answer[]
  explanation: string
}

export type StudyMode = 'flashcard' | 'memorize' | 'practice'

export type ExamContent = {
  label: string
  questions: Question[]
}

export const examLabels: Record<ExamType, string> = {
  vul: 'VUL',
  traditional: 'Traditional',
}

export const modeLabels: Record<StudyMode, string> = {
  flashcard: 'Flash Card',
  memorize: 'Memorize',
  practice: 'Practice Exam',
}

export function getExamContent(type: ExamType, content: ExamContent): Question[] {
  void type
  return content.questions
}
