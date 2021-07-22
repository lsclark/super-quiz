import {
  PlayerScore,
  QuestionColumn,
} from "../frontend/src/app/question-types";
import { PlayerState } from "./player";

export type USConnectMessage = {
  name: string;
  type: "connect";
};

export type DSQuestionsMessage = {
  name: string;
  type: "questions";
  questions: QuestionColumn[];
};

export type USSubmitMessage = {
  name: string;
  type: "submission";
  index: number;
  submission: string | number;
};

export type DSPlayerStatusMessage = {
  name: string;
  type: "player_status";
  status: PlayerState;
};

export type DSScoreboardMessage = {
  name: string;
  type: "scoreboard";
  scores: PlayerScore[];
};

export type USTargetSubmitMessage = {
  name: string;
  type: "target_submit";
  letters: string;
  submission: string;
};

export type DSTargetAssignment = {
  name: string;
  type: "target_assignment";
  centre: string;
  others: string[];
  previous: string[];
  score: number;
};

export type DSTargetMarking = {
  name: string;
  type: "target_marking";
  letters: string;
  submission: string;
  correct: boolean;
  score: number;
};

export type QuizMessage =
  | USConnectMessage
  | USSubmitMessage
  | DSPlayerStatusMessage
  | DSQuestionsMessage
  | DSScoreboardMessage
  | USTargetSubmitMessage
  | DSTargetAssignment
  | DSTargetMarking;
