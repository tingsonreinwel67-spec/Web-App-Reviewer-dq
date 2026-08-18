 import type { ExamContent } from './types'

// VUL exam content. Replace this temporary shared set with VUL-specific questions.
export const vulContent: ExamContent = {
  label: 'VUL',
  questions: [
    { id: 1, section: 'Insurance Basics', prompt: 'Which principle of insurance requires the insured to disclose all material facts to the insurer?', answers: [{ id: 'a', text: 'Indemnity' }, { id: 'b', text: 'Utmost good faith', correct: true }, { id: 'c', text: 'Contribution' }, { id: 'd', text: 'Subrogation' }], explanation: 'Utmost good faith requires both parties to disclose all material facts that could influence the underwriting decision.' },
    { id: 2, section: 'Life & Health', prompt: 'What is the primary purpose of a life insurance beneficiary designation?', answers: [{ id: 'a', text: 'To set the policy premium' }, { id: 'b', text: 'To select the policy owner' }, { id: 'c', text: 'To identify who receives the death benefit', correct: true }, { id: 'd', text: 'To determine the policy term' }], explanation: 'A beneficiary designation names the person or entity who receives the policy proceeds after the insured dies.' },
    { id: 3, section: 'Regulation', prompt: 'An insurance producer must keep client records for how long after a policy is issued?', answers: [{ id: 'a', text: 'One year' }, { id: 'b', text: 'Three years' }, { id: 'c', text: 'Five years', correct: true }, { id: 'd', text: 'Ten years' }], explanation: 'Most state regulations require producers to retain transaction records for at least five years.' },
  ],
}
