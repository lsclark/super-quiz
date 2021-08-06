export interface PlayerScore {
  name: string;
  score: number;
}

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

export enum QuestionState {
  UnAnswered,
  Correct,
  Incorrect,
  DelegatedPending,
  DelegatedComplete,
}

export type DisplayAnswer = {
  index: number;
  answer: string;
};

export type PlayerState = {
  score: number;
  questions: { [index: number]: QuestionState };
  answers: DisplayAnswer[];
};

export type DSPlayerStatusMessage = {
  name: string;
  type: 'player_status';
  status: PlayerState;
};

export type DSScoreboardMessage = {
  name: string;
  type: 'scoreboard';
  scores: PlayerScore[];
};

export type DSQuestionsMessage = {
  name: string;
  type: 'questions';
  questions: QuestionColumn[];
};

export type USSubmitMessage = {
  name: string;
  type: 'submission';
  index: number;
  submission: number | string;
};

export type USGroupChallengeOrigin = {
  name: string;
  type: 'group-origin';
  index: number;
  wager: number;
};

export type DSGroupChallengeDistribute = {
  name: string;
  origin: string;
  type: 'group-distribute';
  question: QuestionDisplay;
  wager: number;
};

export type USGroupChallengeSubmit = {
  name: string;
  origin: string;
  type: 'group-submit';
  question: QuestionDisplay;
  submission: number | string;
};

export type DSGroupChallengeOutcome = {
  name: string;
  type: 'group-outcome';
  origin: string;
  victor: string | null;
  wager: number;
  question: QuestionDisplay;
};

export type USPersonalChallengeOrigin = {
  name: string;
  type: 'personal-origin';
  index: number;
  delegate: string;
};

export type DSPersonalChallengeDistribute = {
  name: string;
  type: 'personal-distribute';
  origin: string;
  question: QuestionDisplay;
};

export type USPersonalChallengeSubmit = {
  name: string;
  type: 'personal-submit';
  origin: string;
  question: QuestionDisplay;
  submission: number | string;
};

export type DSPersonalChallengeOutcome = {
  name: string;
  type: 'personal-outcome';
  origin: string;
  delegate: string;
  question: QuestionDisplay;
  answer: string;
  success: boolean;
};

export type USConnectMessage = {
  name: string;
  type: 'connect';
};

export type DSTimeoutMessage = {
  name: string;
  type: 'timeout';
};

export type USTargetSubmitMessage = {
  name: string;
  type: 'target_submit';
  letters: string;
  submission: string;
};

export type DSTargetAssignment = {
  name: string;
  type: 'target_assignment';
  centre: string;
  others: string[];
  previous: string[];
  score: number;
};

export type DSTargetMarking = {
  name: string;
  type: 'target_marking';
  letters: string;
  submission: string;
  correct: boolean;
  score: number;
};

export type QuizMessage =
  | USConnectMessage
  | DSTimeoutMessage
  | USSubmitMessage
  | DSPlayerStatusMessage
  | DSQuestionsMessage
  | DSScoreboardMessage
  | USTargetSubmitMessage
  | DSTargetMarking
  | DSTargetAssignment
  | DSGroupChallengeDistribute
  | DSGroupChallengeOutcome
  | DSPersonalChallengeDistribute
  | DSPersonalChallengeOutcome
  | USGroupChallengeOrigin
  | USGroupChallengeSubmit
  | USPersonalChallengeOrigin
  | USPersonalChallengeSubmit;
