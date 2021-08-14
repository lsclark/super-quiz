import { Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { QuestionColumn, QuestionDisplay, ScoreItem } from "./message-types";
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

type ChallengeScore = {
  type:
    | "group-origin"
    | "group-responder"
    | "personal-origin"
    | "personal-delegate";
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
  private challenges: ChallengeScore[] = [];
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
      score: this.quizHost.scorer.getScore(this),
      questions: this.state,
      answers: this.retrieveAnswers(),
    };
  }

  setQuestionState(index: number, state: QuestionState) {
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
      ["group-origin", "GC Origin"],
      ["group-responder", "GC Winnings"],
      ["personal-origin", "Shared Origin"],
      ["personal-delegate", "Shared Delegate"],
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
    let items: ScoreItem[] = [...this.computeChallengeScores()];
    items.push(this.computeQuizScore());
    items.push(this.computeTargetScore());
    return items;
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

  addChallenge(
    type:
      | "group-origin"
      | "group-responder"
      | "personal-origin"
      | "personal-delegate",
    points: number
  ) {
    this.challenges.push({
      type: type,
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
