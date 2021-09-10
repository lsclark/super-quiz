import { PlayerState } from "./player";

export interface QuestionDisplay {
  index: number;
  text: string;
  numeric?: boolean;
  choices?: string[];
  points?: 1 | 2 | 3;
}

export interface QuestionColumn {
  points: 1 | 2 | 3;
  questions: QuestionDisplay[];
}

export type USConnectMessage = {
  name: string;
  type: "connect";
};

export type DSTimeoutMessage = {
  name: string;
  type: "timeout";
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

export type USGroupChallengeOrigin = {
  name: string;
  type: "group-origin";
  index: number;
  wager: number;
};

export type DSGroupChallengeDistribute = {
  name: string;
  origin: string;
  type: "group-distribute";
  question: QuestionDisplay;
  wager: number;
};

export type USGroupChallengeSubmit = {
  name: string;
  origin: string;
  type: "group-submit";
  question: QuestionDisplay;
  submission: number | string;
};

export type DSGroupChallengeOutcome = {
  name: string;
  type: "group-outcome";
  origin: string;
  victor: string | null;
  question: QuestionDisplay;
  wager: number;
};

export type USPersonalChallengeOrigin = {
  name: string;
  type: "personal-origin";
  index: number;
  delegate: string;
};

export type DSPersonalChallengeDistribute = {
  name: string;
  type: "personal-distribute";
  origin: string;
  question: QuestionDisplay;
};

export type USPersonalChallengeSubmit = {
  name: string;
  type: "personal-submit";
  origin: string;
  question: QuestionDisplay;
  submission: number | string;
};

export type DSPersonalChallengeOutcome = {
  name: string;
  type: "personal-outcome";
  origin: string;
  delegate: string;
  question: QuestionDisplay;
  answer: string;
  success: boolean;
};

export type DSPersonalChallengeTimeout = {
  name: string;
  type: "personal-timeout";
  origin: string;
  delegate: string;
  question: QuestionDisplay;
  cancel?: boolean;
};

export type PlayerScore = {
  name: string;
  score: number;
};

export type ScoreItem = {
  description: string;
  score: number;
  bonus: boolean;
};

export type DSScoreboardMessage = {
  name: string;
  score: number;
  type: "scoreboard";
  scores: PlayerScore[];
  breakdown: ScoreItem[];
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

export type DSCollisionChallengeStart = {
  name: string;
  type: "collision_challenge_start";
  players: number;
};

export type USCollisionChallengeSubmit = {
  name: string;
  type: "collision_challenge_submit";
  submission: number;
};

export type DSCollisionChallengeOutcome = {
  name: string;
  type: "collision_challenge_outcome";
  winner: string | null;
  points: number | null;
  submissions: [string, number][];
};

export type DSVocabularyChallengeStart = {
  name: string;
  type: "vocabulary_challenge_start";
};

export type USVocabularyChallengeSubmit = {
  name: string;
  type: "vocabulary_challenge_submit";
  submission: string;
};

export type DSVocabularyChallengeOutcome = {
  name: string;
  type: "vocabulary_challenge_outcome";
  winners: string[];
  points: number;
  submissions: [string, string, boolean][];
};

export type QuizMessage =
  | USConnectMessage
  | DSTimeoutMessage
  | USSubmitMessage
  | DSPlayerStatusMessage
  | DSQuestionsMessage
  | DSScoreboardMessage
  | USTargetSubmitMessage
  | DSTargetAssignment
  | DSTargetMarking
  | DSGroupChallengeDistribute
  | DSGroupChallengeOutcome
  | DSPersonalChallengeDistribute
  | DSPersonalChallengeOutcome
  | DSPersonalChallengeTimeout
  | USGroupChallengeOrigin
  | USGroupChallengeSubmit
  | USPersonalChallengeOrigin
  | USPersonalChallengeSubmit
  | USVocabularyChallengeSubmit
  | DSVocabularyChallengeOutcome
  | DSVocabularyChallengeStart
  | DSCollisionChallengeOutcome
  | USCollisionChallengeSubmit
  | DSCollisionChallengeStart;
