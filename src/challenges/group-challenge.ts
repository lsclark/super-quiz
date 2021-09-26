import { Observable, Subject, timer } from "rxjs";

import { QuestionDisplay, QuizMessage } from "../models/game-message-types";
import Player, { QuestionState } from "../player";
import QuizHost from "../quiz-host";

const timeout = 30 * 1000;

function setsEqual<T>(setA: Set<T>, setB: Set<T>): boolean {
  if (setA.size != setB.size) return false;
  for (const a of setA) if (!setB.has(a)) return false;
  return true;
}

type GroupChallenge = {
  origin: Player;
  wager: number;
  question: QuestionDisplay;
  activePlayers: Set<string>;
  submitted: Set<string>;
  complete: boolean;
  finished$: Subject<boolean>;
};

type Submission = {
  player: Player;
  origin: string;
  question: QuestionDisplay;
  submission: string | number;
};

export class GroupChallengeManager {
  private challenges: GroupChallenge[] = [];
  private submissions$ = new Subject<Submission>();

  constructor(
    private outgoing$: Subject<QuizMessage>,
    private quizHost: QuizHost
  ) {
    this.submissions$.subscribe(async (sub) => {
      const challenge = this.challenges.find(
        (ch) =>
          ch.origin.name == sub.origin &&
          ch.question.index == sub.question.index
      );
      if (!challenge || challenge.complete) return;

      const correct = await challenge.origin.submitAnswer(
        sub.question.index,
        sub.submission,
        true
      );
      if (correct) {
        this.closeout(challenge, sub.player);
      } else {
        challenge.submitted.add(sub.player.name);
        if (setsEqual(challenge.activePlayers, challenge.submitted)) {
          this.closeout(challenge, challenge.origin);
        }
      }
    });
  }

  create(
    origin: Player,
    wager: number,
    question: QuestionDisplay
  ): Observable<boolean> {
    const active = Object.entries(this.quizHost.players)
      .filter(([name, other]) => other.alive && name != origin.name)
      .map(([name]) => name);
    const challenge: GroupChallenge = {
      origin: origin,
      wager: wager,
      question: question,
      activePlayers: new Set(active),
      submitted: new Set<string>(),
      complete: false,
      finished$: new Subject<boolean>(),
    };
    this.challenges.push(challenge);
    timer(timeout).subscribe(() => {
      if (!challenge.complete) {
        this.closeout(challenge, challenge.origin);
      }
    });
    origin.setQuestionState(question.index, QuestionState.DelegatedPending);
    this.outgoing$.next({
      type: "player_status",
      name: origin.name,
      status: origin.getPlayerState(),
    });
    this.outgoing$.next({
      type: "group-distribute",
      name: "_broadcast",
      origin: origin.name,
      question: question,
      wager: wager,
    });
    return challenge.finished$;
  }

  submit(
    origin: string,
    player: Player,
    question: QuestionDisplay,
    submission: number | string
  ): void {
    const sub: Submission = {
      origin: origin,
      question: question,
      player: player,
      submission: submission,
    };
    this.submissions$.next(sub);
  }

  cancel(player: string, index: number): void {
    console.log("END", player, index);
    this.challenges
      .filter((challenge) => {
        if (challenge.complete) return false;
        if (challenge.origin.name !== player) return false;
        if (challenge.question.index !== index) return false;
        return true;
      })
      .forEach((challenge) => {
        challenge.complete = true;
        challenge.finished$.next(true);
        this.outgoing$.next({
          type: "group-outcome",
          name: "_broadcast",
          victor: null,
          origin: challenge.origin.name,
          question: challenge.question,
          wager: challenge.wager,
        });
      });
  }

  closeout(challenge: GroupChallenge, victor: Player): void {
    challenge.complete = true;
    challenge.finished$.next(true);
    challenge.origin.setQuestionState(
      challenge.question.index,
      QuestionState.DelegatedComplete
    );
    if (victor.name == challenge.origin.name) {
      challenge.origin.addChallenge(
        "group-origin",
        challenge.origin.name,
        challenge.wager
      );
    } else {
      victor.addChallenge(
        "group-responder",
        challenge.origin.name,
        challenge.wager
      );
      challenge.origin.addChallenge(
        "group-origin",
        victor.name,
        -challenge.wager
      );
    }
    this.outgoing$.next({
      type: "group-outcome",
      name: "_broadcast",
      victor: victor.name,
      origin: challenge.origin.name,
      question: challenge.question,
      wager: challenge.wager,
    });
    this.outgoing$.next({
      type: "player_status",
      name: challenge.origin.name,
      status: challenge.origin.getPlayerState(),
    });
    this.quizHost.scorer.distributeScores();
  }
}
