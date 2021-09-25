import { Subject, timer } from "rxjs";
import {
  DSPersonalChallengeOutcome,
  DSPersonalChallengeTimeout,
  QuestionDisplay,
  QuizMessage,
} from "../models/game-message-types";
import Player, { QuestionState } from "../player";
import QuizHost from "../quiz-host";

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

  create(origin: Player, question: QuestionDisplay, delegate: Player): void {
    const challenge: PersonalChallenge = {
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
  ): Promise<void> {
    const challenge = this.challenges.find(
      (ch) =>
        origin == ch.origin.name &&
        delegate == ch.delegate.name &&
        question.index == ch.question.index
    );
    if (!challenge || challenge.complete) return;
    const correct = await challenge.origin.submitAnswer(
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
        challenge.origin.name,
        (question.points ?? 0) / 2
      );
      challenge.origin.addChallenge(
        "personal-origin",
        challenge.delegate.name,
        (question.points ?? 0) / 2
      );

      this.quizHost.scorer.distributeScores();
      this.outgoing$.next({
        type: "player_status",
        name: challenge.origin.name,
        status: challenge.origin.getPlayerState(),
      });
    }
    const answer = challenge.origin.getAnswer(question.index);
    [challenge.origin.name, challenge.delegate.name].forEach((name) => {
      const outcome_delegate: DSPersonalChallengeOutcome = {
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

  cancel(origin: string, index: number): void {
    this.challenges
      .filter((challenge) => {
        if (challenge.complete) return false;
        if (challenge.origin.name !== origin) return false;
        if (challenge.question.index !== index) return false;
        return true;
      })
      .forEach((challenge) => {
        this.timeout(challenge, true);
      });
  }

  timeout(challenge: PersonalChallenge, cancel = false): void {
    if (challenge.complete) return;
    challenge.origin.setQuestionState(
      challenge.question.index,
      QuestionState.UnAnswered
    );
    challenge.complete = true;
    [challenge.origin.name, challenge.delegate.name].forEach((name) => {
      const timeoutMsg: DSPersonalChallengeTimeout = {
        type: "personal-timeout",
        name: name,
        origin: challenge.origin.name,
        delegate: challenge.delegate.name,
        question: challenge.question,
        cancel: cancel,
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
