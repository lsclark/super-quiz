export interface TargetLetters {
  centre: string;
  others: string[];
  previous: string[];
}

export type TargetState = {
  index: number;
  input?: string;
  fixed: boolean;
  correct: boolean;
};

export type TargetResult = {
  letters: string;
  submission: string;
  correct: boolean;
};
