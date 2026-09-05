export type MasteryCounts = {
  mastered: number;
  total: number;
};

export type Eligibility = {
  eligible: boolean;
  flashcards: MasteryCounts;
  memorization: MasteryCounts;
};
