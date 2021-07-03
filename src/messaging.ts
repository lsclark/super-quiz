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

export type QuizMessage =
  | USConnectMessage
  | USSubmitMessage
  | DSPlayerStatusMessage
  | DSQuestionsMessage
  | DSScoreboardMessage;
