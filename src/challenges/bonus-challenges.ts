import { Subject, timer } from "rxjs";
import { QuizMessage } from "../models/game-message-types";
import QuizHost from "../quiz-host";
import { TargetManager } from "../target";

const TIMEOUT = 35 * 1000;

export class VocabularyChallenge {
  POINTS_PER_LETTER = 0.333;
  complete = false;
  submissions: { [key: string]: string } = {};

  constructor(
    private players: string[],
    private targetManager: TargetManager,
    private outgoing: Subject<QuizMessage>,
    private quizHost: QuizHost
  ) {
    timer(TIMEOUT).subscribe(() => {
      if (!this.complete) {
        this.closeout();
      }
    });
  }

  submit(player: string, word: string): void {
    if (this.complete) return;
    if (player in this.submissions) return;
    if (!this.players.find((plyr: string) => plyr == player)) return;
    this.submissions[player] = word;
    if (Object.keys(this.submissions).length == this.players.length)
      this.closeout();
  }

  closeout(): void {
    this.complete = true;
    const submissions: [string, string][] = Object.entries(this.submissions);
    submissions.sort(([, word1], [, word2]) => word2.length - word1.length);
    const marking: [string, string, boolean][] = submissions.map(
      ([name, word]) => {
        return [name, word, this.targetManager.spellcheck(word)];
      }
    );
    const successful = marking.filter(([, , correct]) => correct);
    const winners = successful
      .filter(([, word]) => word.length == successful[0][1].length)
      .map(([name, ,]) => name);

    const points = successful.length
      ? successful[0][1].length * this.POINTS_PER_LETTER
      : 0;
    winners.forEach((playerName) => {
      this.quizHost.scorer.addManual(
        playerName,
        "Vocabulary Challenge",
        points
      );
    });
    this.quizHost.scorer.distributeScores();
    this.outgoing.next({
      type: "vocabulary_challenge_outcome",
      name: "_broadcast",
      points: points,
      submissions: marking,
      winners: winners,
    });
  }
}

export class CollisionChallenge {
  complete = false;
  submissions: { [key: string]: number } = {};

  constructor(
    public players: string[],
    private outgoing: Subject<QuizMessage>,
    private quizHost: QuizHost
  ) {
    timer(TIMEOUT).subscribe(() => {
      if (!this.complete) {
        this.closeout();
      }
    });
  }

  submit(player: string, request: number): void {
    if (this.complete) return;
    if (player in this.submissions) return;
    if (!this.players.find((plyr) => plyr == player)) return;
    this.submissions[player] = request;
    if (Object.keys(this.submissions).length == this.players.length)
      this.closeout();
  }

  closeout(): void {
    this.complete = true;
    const submissions: [string, number][] = Object.entries(this.submissions);
    submissions.sort(([, req1], [, req2]) => req2 - req1);
    let currRequest: null | number = null;
    let requesters: string[] = [];

    for (const [name, request] of submissions) {
      if (request === null) {
        requesters = [name];
        currRequest = request;
      } else if (request == currRequest) {
        requesters.push(name);
      } else if (requesters.length == 1) {
        break;
      } else {
        currRequest = request;
        requesters = [name];
      }
    }

    let winner: string | null, points: number | null;
    if (requesters.length == 1) {
      winner = requesters[0];
      points = currRequest;
    } else {
      winner = null;
      points = 0;
    }

    if (winner && points)
      this.quizHost.scorer.addManual(winner, "Collision Challenge", points);
    this.quizHost.scorer.distributeScores();
    this.outgoing.next({
      type: "collision_challenge_outcome",
      name: "_broadcast",
      points: points,
      submissions: submissions,
      winner: winner,
    });
  }
}
