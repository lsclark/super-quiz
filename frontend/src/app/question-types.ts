export interface QuestionDisplay {
  index: number;
  text: string;
  choices?: string[];
  points?: 1 | 2 | 3;
}

export interface QuestionColumn {
  points: 1 | 2 | 3;
  questions: QuestionDisplay[];
}

export interface Solution {
  index: number;
  answer: string;
}

export interface PlayerState {
  index: number;
  submitted?: boolean;
  correct?: boolean;
}

export interface PlayerScore {
  name: string;
  score: number;
}
