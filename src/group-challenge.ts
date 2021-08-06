import { Subject, timer } from "rxjs";
import { QuestionDisplay, QuizMessage } from "./message-types";
import Player from "./player";
import QuizHost from "./quiz-host";

const timeout = 30 * 1000;

function setsEqual<T>(seta: Set<T>, setb: Set<T>): boolean {
  if (seta.size != setb.size) return false;
  for (const a of seta) if (!setb.has(a)) return false;
  return true;
}

type GroupChallenge = {
  origin: Player;
  wager: number;
  question: QuestionDisplay;
  activePlayers: Set<string>;
  submitted: Set<string>;
  complete: boolean;
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
      let challenge = this.challenges.find(
        (ch) =>
          ch.origin.name == sub.origin &&
          ch.question.index == sub.question.index
      );
      if (!challenge || challenge.complete) return;

      let correct = await challenge.origin.submitAnswer(
        sub.question.index,
        sub.submission
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
    question: QuestionDisplay,
    activePlayers: string[]
  ) {
    let challenge: GroupChallenge = {
      origin: origin,
      wager: wager,
      question: question,
      activePlayers: new Set(activePlayers),
      submitted: new Set<string>(),
      complete: false,
    };
    this.challenges.push(challenge);
    timer(timeout).subscribe(() => {
      if (!challenge.complete) {
        this.closeout(challenge, challenge.origin);
      }
    });
  }

  submit(
    origin: string,
    player: Player,
    question: QuestionDisplay,
    submission: number | string
  ) {
    let sub: Submission = {
      origin: origin,
      question: question,
      player: player,
      submission: submission,
    };
    this.submissions$.next(sub);
  }

  closeout(challenge: GroupChallenge, victor: Player) {
    challenge.complete = true;
    challenge.origin.challengeOutcome(
      challenge.question.index,
      victor.name == challenge.origin.name ? "success" : "failure"
    );
    if (victor.name == challenge.origin.name) {
      challenge.origin.addBonus(
        `group-${challenge.origin.name}-${challenge.question.index}`,
        challenge.wager
      );
    } else {
      victor.addBonus(
        `group-${challenge.origin.name}-${challenge.question.index}`,
        challenge.wager
      );
      challenge.origin.addBonus(
        `group-${challenge.origin.name}-${challenge.question.index}`,
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
    this.outgoing$.next({
      type: "scoreboard",
      name: "_broadcast",
      scores: this.quizHost.makeScoreboard(),
    });
  }
}
