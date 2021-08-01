import { Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { PlayerScore, QuestionColumn } from "./message-types";
import {
  checkAnswerCorrect,
  formatQuestionDisplay,
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
}

type Bonus = {
  identifier: [string, number];
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

export default class Player {
  alive: boolean;
  private questions: Question[];
  private indexes: { [index: number]: Question };
  private displayQuestions: QuestionColumn[];
  private state: { [index: number]: AnswerState };
  private bonuses: Bonus[];
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

    this.bonuses = [];
    this.state = {};

    [this.indexes, this.displayQuestions] = formatQuestionDisplay(
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
    if (await checkAnswerCorrect(question, submission)) {
      this.state[index] = AnswerState.Correct;
      this.computeScore();
      return true;
    } else {
      this.state[index] = AnswerState.Incorrect;
      return false;
    }
  }

  submitTarget(letters: string, submission: string): [boolean, number] {
    let target = this.targets.filter((target) => target.equivalent(letters))[0];
    return [target.checkSubmission(submission), target.getScore()];
  }

  retrieveAnswers(): DisplayAnswer[] {
    let output: DisplayAnswer[] = [];
    for (let [index, state] of getEntries(this.state)) {
      if (state != AnswerState.UnAnswered) {
        let question = this.indexes[index];

        if (question.type == "multichoice")
          var answer = question.choices[question.answer];
        else answer = question.answer;

        output.push({ index: index, answer: answer });
      }
    }
    return output;
  }
}
