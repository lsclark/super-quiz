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

export enum QuestionState {
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
  private state: { [index: number]: QuestionState } = {};
  private bonuses: Bonus[] = [];
  targets: Target[];
  private timeout = new Subject<true>();

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
      this.state[index] = QuestionState.UnAnswered;
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

  setQuestionState(index: number, state: QuestionState) {
    this.state[index] = state;
  }

  computeScore(): number {
    let score = 0;
    getEntries(this.state).forEach(([index, state]) => {
      if (state == QuestionState.Correct) {
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
    submission: string | number,
    challenge: boolean
  ): Promise<boolean> {
    let question = this.indexes[index];
    if (await checkAnswerCorrect(question, submission)) {
      if (!challenge) this.state[index] = QuestionState.Correct;
      return true;
    } else {
      if (!challenge) this.state[index] = QuestionState.Incorrect;
      return false;
    }
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
        state != QuestionState.UnAnswered &&
        state != QuestionState.DelegatedPending
      ) {
        let answer = this.getAnswer(index);
        output.push({ index: index, answer: answer });
      }
    }
    return output;
  }
}
