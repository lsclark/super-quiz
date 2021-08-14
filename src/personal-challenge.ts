import { Subject, timer } from "rxjs";
import {
  DSPersonalChallengeOutcome,
  DSPersonalChallengeTimeout,
  QuestionDisplay,
  QuizMessage,
} from "./message-types";
import Player, { QuestionState } from "./player";
import QuizHost from "./quiz-host";

const timeout = 30 * 1000;

type PersonalChallenge = {
  origin: Player;
  delegate: Player;
  question: QuestionDisplay;
  complete: boolean;
};

export class PersonalChallengeManager {
  challenges: PersonalChallenge[] = [];

  constructor(
    private outgoing$: Subject<QuizMessage>,
    private quizHost: QuizHost
  ) {}

  create(origin: Player, question: QuestionDisplay, delegate: Player) {
    let challenge: PersonalChallenge = {
      origin: origin,
      delegate: delegate,
      question: question,
      complete: false,
    };
    this.challenges.push(challenge);
    origin.setQuestionState(question.index, QuestionState.DelegatedPending);
    this.outgoing$.next({
      type: "player_status",
      name: origin.name,
      status: origin.getPlayerState(),
    });
    this.outgoing$.next({
      type: "personal-distribute",
      name: delegate.name,
      origin: origin.name,
      question: question,
    });
    timer(timeout).subscribe(() => {
      this.timeout(challenge);
    });
  }

  async submit(
    origin: string,
    delegate: string,
    question: QuestionDisplay,
    submission: number | string
  ) {
    let challenge = this.challenges.find(
      (ch) =>
        origin == ch.origin.name &&
        delegate == ch.delegate.name &&
        question.index == ch.question.index
    );
    if (!challenge || challenge.complete) return;
    let correct = await challenge.origin.submitAnswer(
      question.index,
      submission,
      true
    );
    challenge.complete = true;
    challenge.origin.setQuestionState(
      question.index,
      QuestionState.DelegatedComplete
    );

    if (correct) {
      challenge.delegate.addChallenge(
        "personal-delegate",
        question.points! / 2
      );
      challenge.origin.addChallenge("personal-origin", question.points! / 2);

      this.quizHost.scorer.distributeScores();
      this.outgoing$.next({
        type: "player_status",
        name: challenge.origin.name,
        status: challenge.origin.getPlayerState(),
      });
    }
    let answer = challenge.origin.getAnswer(question.index);
    [challenge.origin.name, challenge.delegate.name].forEach((name) => {
      let outcome_delegate: DSPersonalChallengeOutcome = {
        type: "personal-outcome",
        name: name,
        origin: origin,
        delegate: delegate,
        question: question,
        answer: answer,
        success: correct,
      };
      this.outgoing$.next(outcome_delegate);
    });
  }

  timeout(challenge: PersonalChallenge) {
    if (challenge.complete) return;
    challenge.origin.setQuestionState(
      challenge.question.index,
      QuestionState.UnAnswered
    );
    challenge.complete = true;
    [challenge.origin.name, challenge.delegate.name].forEach((name) => {
      let timeoutMsg: DSPersonalChallengeTimeout = {
        type: "personal-timeout",
        name: name,
        origin: challenge.origin.name,
        delegate: challenge.delegate.name,
        question: challenge.question,
      };
      this.outgoing$.next(timeoutMsg);
    });
    this.outgoing$.next({
      type: "player_status",
      name: challenge.origin.name,
      status: challenge.origin.getPlayerState(),
    });
  }
}
