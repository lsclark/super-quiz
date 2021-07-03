import { QuestionColumn } from '../question-types';

export enum AnswerState {
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
  questions: { [index: number]: AnswerState };
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

export type QuizMessage =
  | USConnectMessage
  | USSubmitMessage
  | DSPlayerStatusMessage
  | DSQuestionsMessage
  | DSScoreboardMessage;
