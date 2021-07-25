import { QuestionColumn } from '../question-types';

export enum QuestionState {
  UnAnswered,
  Correct,
  Incorrect,
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

export interface PlayerScore {
  name: string;
  score: number;
}

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
  | DSTargetAssignment;
