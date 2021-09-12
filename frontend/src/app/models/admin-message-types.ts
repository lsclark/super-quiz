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
  tolerance?: number;
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

export interface AdminUSQuestionOverride extends AdminUS {
  type: 'adminQuestionOverride';
  name: string;
  index: number;
  state: QuestionState;
}

export interface AdminUSAwardBonus extends AdminUS {
  type: 'adminAwardBonus';
  name: string;
  description: string;
  score: number;
}

export interface AdminUSGameControl extends AdminUS {
  type: 'adminGameControl';
  state: 'start' | 'stop';
}

export interface AdminUSChallengeStart extends AdminUS {
  type: 'adminStartChallenge';
  challenge: 'vocabulary' | 'collision';
}

export interface AdminUSTerminate extends AdminUS {
  type: 'adminTerminate';
}

export type AdminMessage =
  | AdminDSPlayerState
  | AdminUSConnect
  | AdminUSQuestionOverride
  | AdminUSAwardBonus
  | AdminUSGameControl
  | AdminUSChallengeStart
  | AdminUSTerminate;
