import { Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";

import { AdminPlayer, AdminQuestionState } from "./models/admin-message-types";
import {
  QuestionColumn,
  QuestionDisplay,
  ScoreItem,
} from "./models/game-message-types";
import {
  checkAnswerCorrect,
  formatQuestion,
  formatQuestionsDisplay,
  Question,
} from "./questions/question";
import QuestionLoader from "./questions/question-loader";
import QuizHost from "./quiz-host";
import { Target, TargetManager } from "./target";

const TIMEOUT_WARNING = 4 * 60 * 1000;
const TIMEOUT_DEATH = 5 * 60 * 1000;

const getKeys = Object.keys as <T>(obj: T) => Array<keyof T>;
const getEntries = Object.entries as <T>(
  obj: T
) => Array<[keyof T, T[keyof T]]>;

export enum QuestionState {
  UnAnswered,
  Correct,
  Incorrect,
  DelegatedPending,
  DelegatedComplete,
}

type ChallengeScore = {
  type:
    | "group-origin"
    | "group-responder"
    | "personal-origin"
    | "personal-delegate";
  player: string;
  points: number;
};

export type PlayerState = {
  score: number;
  questions: { [index: number]: QuestionState };
  answers: DisplayAnswer[];
};

export type DisplayAnswer = {
  index: number;
  answer: string;
};

export default class Player {
  alive: boolean;
  private questions: Question[];
  private indexes: { [index: number]: Question };
  private displayQuestions: QuestionColumn[];
  state: { [index: number]: QuestionState } = {};
  challenges: ChallengeScore[] = [];
  private submissions: { [index: number]: number | string } = {};
  targets: Target[];
  private timeout = new Subject<true>();
  private lastScore: ScoreItem[] = [];

  targetSubmissions = new Set<string>();

  constructor(
    public name: string,
    questionManager: QuestionLoader,
    targetManager: TargetManager,
    private quizHost: QuizHost
  ) {
    this.alive = true;
    this.questions = questionManager.deal();
    this.targets = targetManager.getTargets() ?? [];

    [this.indexes, this.displayQuestions] = formatQuestionsDisplay(
      this.questions
    );
    getKeys(this.indexes).forEach((index: number) => {
      this.state[index] = QuestionState.UnAnswered;
    });

    this.timeout.pipe(debounceTime(TIMEOUT_WARNING)).subscribe(() => {
      this.quizHost.timeoutWarning(this.name);
    });

    this.timeout.pipe(debounceTime(TIMEOUT_DEATH)).subscribe(() => {
      this.alive = false;
    });
  }

  accessed(): void {
    this.alive = true;
    this.timeout.next(true);
  }

  getQuestion(index: number): QuestionDisplay {
    const question = this.indexes[index];
    return formatQuestion(index, question);
  }

  getDisplayQuestions(): QuestionColumn[] {
    return this.displayQuestions;
  }

  getPlayerState(): PlayerState {
    return {
      score: this.quizHost.scorer.getScore(this),
      questions: this.state,
      answers: this.retrieveAnswers(),
    };
  }

  setQuestionState(index: number, state: QuestionState): void {
    this.state[index] = state;
  }

  private computeQuizScore(): ScoreItem {
    return {
      description: "Quiz Questions",
      score: getEntries(this.state).reduce((acc: number, [index, state]) => {
        return state == QuestionState.Correct
          ? acc + this.indexes[index].points
          : acc;
      }, 0),
      bonus: false,
    };
  }

  private computeTargetScore(): ScoreItem {
    return {
      description: "Target",
      score: Math.max(...this.targets.map((tgt) => tgt.getScore())),
      bonus: false,
    };
  }

  private computeChallengeScores(): ScoreItem[] {
    return [
      ["group-origin", "Lost Betting Against Intellects"],
      ["group-responder", "Gains from Others' Wagers"],
      ["personal-origin", "Help from Friends"],
      ["personal-delegate", "Gains Helping Friends"],
    ]
      .map(([type, desc]): [string, number] => {
        return [
          desc,
          this.challenges
            .filter((chllng) => chllng.type == type)
            .reduce((acc: number, chlng) => acc + chlng.points, 0),
        ];
      })
      .filter(([, val]) => val != 0)
      .map(([desc, score]): ScoreItem => {
        return {
          score: score,
          description: desc,
          bonus: false,
        };
      });
  }

  makePlayerScore(): ScoreItem[] {
    const items: ScoreItem[] = [...this.computeChallengeScores()];
    items.push(this.computeQuizScore());
    items.push(this.computeTargetScore());
    this.lastScore = items;
    return items;
  }

  async submitAnswer(
    index: number,
    submission: string | number,
    challenge: boolean
  ): Promise<boolean> {
    this.submissions[index] = submission;
    const question = this.indexes[index];
    if (await checkAnswerCorrect(question, submission)) {
      if (!challenge) this.state[index] = QuestionState.Correct;
      return true;
    } else {
      if (!challenge) this.state[index] = QuestionState.Incorrect;
      return false;
    }
  }

  addChallenge(
    type:
      | "group-origin"
      | "group-responder"
      | "personal-origin"
      | "personal-delegate",
    player: string,
    points: number
  ): void {
    this.challenges.push({
      type: type,
      player: player,
      points: points,
    });
  }

  submitTarget(letters: string, submission: string): [boolean, number] {
    submission = submission.toLowerCase();
    if (submission.length <= 9 && submission.length > 3)
      this.targetSubmissions.add(submission);
    const target = this.targets.filter((target) =>
      target.equivalent(letters)
    )[0];
    return [target.checkSubmission(submission), target.getScore()];
  }

  getAnswer(index: number): string {
    const question = this.indexes[index];
    if (question.type == "multichoice")
      return question.choices[question.answer];
    else if (question.type == "numeric") return question.answer.toString();
    else return question.answer;
  }

  retrieveAnswers(): DisplayAnswer[] {
    const output: DisplayAnswer[] = [];
    for (const [index, state] of getEntries(this.state)) {
      if (
        state != QuestionState.UnAnswered &&
        state != QuestionState.DelegatedPending
      ) {
        const answer = this.getAnswer(index);
        output.push({ index: index, answer: answer });
      }
    }
    return output;
  }

  adminState(): AdminPlayer {
    return {
      name: this.name,
      questions: getEntries(this.indexes).reduce(
        (data: { [index: number]: AdminQuestionState }, [index, question]) => {
          data[index] = {
            question: question.question,
            answer: question.answer,
            type: question.type,
            status: this.state[index],
            submission: this.submissions[index] ?? null,
            ...(question.type == "multichoice"
              ? { choices: question.choices }
              : {}),
            ...(question.type == "numeric" && !!question.tolerance
              ? { tolerance: question.tolerance }
              : {}),
          };
          return data;
        },
        {}
      ),
      scores: this.lastScore,
    };
  }
}
