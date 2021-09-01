export type ScoreItem = {
  description: string;
  score: number;
  bonus: boolean;
};

export enum QuestionState {
  UnAnswered,
  Correct,
  Incorrect,
  DelegatedPending,
  DelegatedComplete,
}

export type AdminQuestionState = {
  question: string;
  choices?: string[];
  answer: number | string;
  type: 'freetext' | 'multichoice' | 'numeric';
  status: QuestionState;
  submission: null | string | number;
};

export type AdminPlayer = {
  name: string;
  questions: { [index: number]: AdminQuestionState };
  scores: ScoreItem[];
};

export interface AdminBase {
  admin: true;
}

export interface AdminDSPlayerState extends AdminBase {
  type: 'adminState';
  statuses: AdminPlayer[];
}

export interface AdminUS extends AdminBase {
  auth: string;
}

export interface AdminUSConnect extends AdminUS {
  type: 'adminConnect';
}

export type AdminMessage = AdminDSPlayerState | AdminUSConnect;
