import { Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { PlayerScore, QuestionColumn, QuestionDisplay } from "./message-types";
import {
  checkAnswerCorrect,
  formatQuestion,
  formatQuestionsDisplay,
  Question,
} from "./question";
import QuestionLoader from "./question-loader";
import QuizHost from "./quiz-host";
import { Target, TargetManager } from "./target";

const TIMEOUT_WARNING = 1 * 60 * 1000;
const TIMEOUT_DEATH = 2 * 60 * 1000;

const getKeys = Object.keys as <T extends object>(obj: T) => Array<keyof T>;
const getEntries = Object.entries as <T extends object>(
  obj: T
) => Array<[keyof T, T[keyof T]]>;

export enum AnswerState {
  UnAnswered,
  Correct,
  Incorrect,
  DelegatedPending,
  DelegatedComplete,
}

type Bonus = {
  identifier: string;
  points: number;
};

export type PlayerState = {
  score: number;
  questions: { [index: number]: AnswerState };
  answers: DisplayAnswer[];
};

export type DisplayAnswer = {
  index: number;
  answer: string;
};

type PersonalChallenge = {
  type: "personal";
  index: number;
  delegate: string;
  state: "success" | "failure" | "pending";
};

type GroupChallenge = {
  type: "group";
  index: number;
  wager: number;
  state: "success" | "failure" | "pending";
};

type Challenge = PersonalChallenge | GroupChallenge;

export default class Player {
  alive: boolean;
  private questions: Question[];
  private indexes: { [index: number]: Question };
  private displayQuestions: QuestionColumn[];
  private state: { [index: number]: AnswerState } = {};
  private bonuses: Bonus[] = [];
  targets: Target[];
  private timeout = new Subject<true>();
  private challenges: Challenge[] = [];

  constructor(
    public name: string,
    questionManager: QuestionLoader,
    targetManager: TargetManager,
    private quizHost: QuizHost
  ) {
    this.alive = true;
    this.questions = questionManager.deal();
    this.targets = targetManager.getTargets()!;

    [this.indexes, this.displayQuestions] = formatQuestionsDisplay(
      this.questions
    );
    getKeys(this.indexes).forEach((index: number) => {
      this.state[index] = AnswerState.UnAnswered;
    });

    this.timeout.pipe(debounceTime(TIMEOUT_WARNING)).subscribe(() => {
      this.quizHost.timeoutWarning(this.name);
    });

    this.timeout.pipe(debounceTime(TIMEOUT_DEATH)).subscribe(() => {
      this.alive = false;
    });
  }

  accessed() {
    this.alive = true;
    this.timeout.next(true);
  }

  getQuestion(index: number): QuestionDisplay {
    let question = this.indexes[index];
    return formatQuestion(index, question);
  }

  getDisplayQuestions(): QuestionColumn[] {
    return this.displayQuestions;
  }

  getPlayerState(): PlayerState {
    return {
      score: this.computeScore(),
      questions: this.state,
      answers: this.retrieveAnswers(),
    };
  }

  computeScore(): number {
    let score = 0;
    getEntries(this.state).forEach(([index, state]) => {
      if (state == AnswerState.Correct) {
        score += this.indexes[index].points;
      }
    });
    this.bonuses.forEach((bonus) => {
      score += bonus.points;
    });
    score += Math.max(...this.targets.map((tgt) => tgt.getScore()));
    return score;
  }

  makePlayerScore(): PlayerScore {
    return {
      name: this.name,
      score: this.computeScore(),
    };
  }

  async submitAnswer(
    index: number,
    submission: string | number
  ): Promise<boolean> {
    let question = this.indexes[index];
    let challenge: Challenge | undefined = this.challenges.find(
      (ch) => ch.index == index
    );
    if (await checkAnswerCorrect(question, submission)) {
      if (!challenge) this.state[index] = AnswerState.Correct;
      else {
        this.state[index] = AnswerState.DelegatedComplete;
        if (challenge.type == "personal") {
          challenge.state = "success";
        } else if (challenge.type == "group") {
          // PASS
        }
      }
      return true;
    } else {
      if (!challenge) this.state[index] = AnswerState.Incorrect;
      else {
        this.state[index] = AnswerState.DelegatedComplete;
        if (challenge.type == "personal") {
          challenge.state = "failure";
        } else if (challenge.type == "group") {
          // PASS
        }
      }
      return false;
    }
  }

  challengeOutcome(index: number, outcome: "success" | "failure") {
    let challenge: Challenge | undefined = this.challenges.find(
      (ch) => ch.index == index
    );
    if (!!challenge) challenge.state = outcome;
  }

  addBonus(identifier: string, points: number) {
    this.bonuses.push({
      identifier: identifier,
      points: points,
    });
  }

  submitTarget(letters: string, submission: string): [boolean, number] {
    let target = this.targets.filter((target) => target.equivalent(letters))[0];
    return [target.checkSubmission(submission), target.getScore()];
  }

  getAnswer(index: number): string {
    let question = this.indexes[index];
    if (question.type == "multichoice")
      return question.choices[question.answer];
    else return question.answer;
  }

  retrieveAnswers(): DisplayAnswer[] {
    let output: DisplayAnswer[] = [];
    for (let [index, state] of getEntries(this.state)) {
      if (
        state != AnswerState.UnAnswered &&
        state != AnswerState.DelegatedPending
      ) {
        let answer = this.getAnswer(index);
        output.push({ index: index, answer: answer });
      }
    }
    return output;
  }

  personalChallengeInit(index: number, delegate: string) {
    this.state[index] = AnswerState.DelegatedPending;
    this.challenges.push({
      type: "personal",
      index: index,
      delegate: delegate,
      state: "pending",
    });
  }

  groupChallengeInit(index: number, wager: number) {
    this.state[index] = AnswerState.DelegatedPending;
    this.challenges.push({
      type: "group",
      index: index,
      wager: wager,
      state: "pending",
    });
  }
}
