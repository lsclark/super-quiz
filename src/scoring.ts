import { Subject } from "rxjs";
import { PlayerScore, QuizMessage, ScoreItem } from "./message-types";
import Player from "./player";
import QuizHost from "./quiz-host";

export class Scorer {
  constructor(
    private outgoing$: Subject<QuizMessage>,
    private quizHost: QuizHost
  ) {}

  private scoreItems(): { [key: string]: ScoreItem[] } {
    let scores = this.makeBaseScores();
    let bonuses = this.makeBonuses();
    for (let [name, bonus] of bonuses) {
      if (!!name && !!bonus) {
        if (!scores[name]) scores[name] = [];
        scores[name].push(bonus);
      }
    }
    return scores;
  }

  getScore(player: Player): number {
    let base = player.makePlayerScore();
    for (let [name, bonus] of this.makeBonuses()) {
      if (name == player.name) base.push(bonus);
    }
    return base.reduce((agg, item) => agg + item.score, 0);
  }

  distributeScores() {
    let itemised = this.scoreItems();

    let scoreboard: PlayerScore[] = Object.entries(itemised).map(
      ([name, scoreItems]) => {
        return {
          name: name,
          score: scoreItems.reduce((agg, item) => agg + item.score, 0),
        };
      }
    );

    for (let [name, scoreItems] of Object.entries(itemised)) {
      let score = scoreboard.find((ps) => name == ps.name);
      this.outgoing$.next({
        type: "scoreboard",
        name: name,
        breakdown: scoreItems,
        scores: scoreboard,
        score: score!.score,
      });
    }
  }

  private makeBaseScores(): { [key: string]: ScoreItem[] } {
    return Object.values(this.quizHost.players)
      .filter((plyr: Player) => plyr.alive)
      .reduce((dict: { [key: string]: ScoreItem[] }, plyr: Player) => {
        dict[plyr.name] = plyr.makePlayerScore();
        return dict;
      }, {});
  }

  private makeBonuses(): [string, ScoreItem][] {
    return [...this.targetBonus()];
  }

  private targetBonus(): [string, ScoreItem][] {
    let maxNames: string[] = [];
    let maxSubmits: number = 1;
    for (let [name, player] of Object.entries(this.quizHost.players)) {
      if (!player.alive) continue;
      let submits = player.targets.reduce(
        (previous, current) => previous + current.submissions.size,
        0
      );
      if (submits > maxSubmits) {
        maxNames = [name];
        maxSubmits = submits;
      } else if (submits == maxSubmits) {
        maxNames.push(name);
      }
    }
    return maxNames.map((name) => {
      return [
        name,
        {
          bonus: true,
          description: "Most Target Submissions",
          score: maxNames.length > 1 ? 2.5 : 5,
        },
      ];
    });
  }
}
