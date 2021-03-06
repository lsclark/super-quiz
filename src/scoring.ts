import { Subject } from "rxjs";

import {
  PlayerScore,
  QuizMessage,
  ScoreItem,
} from "./models/game-message-types";
import Player, { QuestionState } from "./player";
import QuizHost from "./quiz-host";

export class Scorer {
  private manualBonuses: [string, ScoreItem][] = [];

  constructor(
    private outgoing$: Subject<QuizMessage>,
    private quizHost: QuizHost
  ) {}

  addManual(player: string, description: string, value: number): void {
    this.manualBonuses.push([
      player,
      { bonus: true, description: description, score: value },
    ]);
  }

  private scoreItems(): { [key: string]: ScoreItem[] } {
    const scores = this.makeBaseScores();
    const bonuses = this.makeBonuses();
    for (const [name, bonus] of bonuses) {
      if (!!name && !!bonus) {
        if (!scores[name]) scores[name] = [];
        scores[name].push(bonus);
      }
    }
    return scores;
  }

  getScore(player: Player): number {
    const base = player.makePlayerScore();
    for (const [name, bonus] of this.makeBonuses()) {
      if (name == player.name) base.push(bonus);
    }
    return base.reduce((agg, item) => agg + item.score, 0);
  }

  distributeScores(): void {
    const itemised = this.scoreItems();

    const scoreboard: PlayerScore[] = Object.entries(itemised).map(
      ([name, scoreItems]) => {
        return {
          name: name,
          score: scoreItems.reduce((agg, item) => agg + item.score, 0),
        };
      }
    );

    for (const [name, scoreItems] of Object.entries(itemised)) {
      const score = scoreboard.find((ps) => name == ps.name);

      this.outgoing$.next({
        type: "scoreboard",
        name: name,
        breakdown: scoreItems,
        scores: scoreboard,
        score: score?.score ?? 0,
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
    return [
      ...this.manualBonuses,
      ...this.targetCorrectBonus(),
      ...this.targetSubmissionsBonus(),
      ...this.delegatorBonus(),
      ...this.quizNonMasterBonus(),
      ...this.profiteerBonus(),
    ];
  }

  private targetCorrectBonus(): [string, ScoreItem][] {
    let maxNames: string[] = [];
    let maxSubmits = 1;
    for (const [name, player] of Object.entries(this.quizHost.players)) {
      if (!player.alive) continue;
      const submits = player.targets.reduce(
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
          description: "Most Correct Target Words",
          score: maxNames.length > 1 ? 3 : 6,
        },
      ];
    });
  }

  private targetSubmissionsBonus(): [string, ScoreItem][] {
    let maxNames: string[] = [];
    let maxSubmits = 1;
    for (const [name, player] of Object.entries(this.quizHost.players)) {
      if (!player.alive) continue;
      const submits = player.targetSubmissions.size;
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
          description: "Most Target Tries",
          score: maxNames.length > 1 ? 1.5 : 3,
        },
      ];
    });
  }

  private quizNonMasterBonus(): [string, ScoreItem][] {
    let maxNames: string[] = [];
    let maxWrongs = 1;
    for (const [name, player] of Object.entries(this.quizHost.players)) {
      if (!player.alive) continue;
      const wrongs = Object.values(player.state).reduce(
        (agg, state) => (state == QuestionState.Incorrect ? agg + 1 : agg),
        0
      );
      if (wrongs > maxWrongs) {
        maxNames = [name];
        maxWrongs = wrongs;
      } else if (wrongs == maxWrongs) {
        maxNames.push(name);
      }
    }
    return maxNames.map((name) => {
      return [
        name,
        {
          bonus: true,
          description: "Quiz Dilettante",
          score: maxNames.length > 1 ? 2 : 4,
        },
      ];
    });
  }

  private delegatorBonus(): [string, ScoreItem][] {
    let maxNames: string[] = [];
    let maxDelegations = 1;
    for (const [name, player] of Object.entries(this.quizHost.players)) {
      if (!player.alive) continue;
      const delegations = Object.values(player.state).reduce(
        (agg, state) =>
          state == QuestionState.DelegatedComplete ||
          state == QuestionState.DelegatedPending
            ? agg + 1
            : agg,
        0
      );
      if (delegations > maxDelegations) {
        maxNames = [name];
        maxDelegations = delegations;
      } else if (delegations == maxDelegations) {
        maxNames.push(name);
      }
    }
    return maxNames.map((name) => {
      return [
        name,
        {
          bonus: true,
          description: "The Delegator",
          score: maxNames.length > 1 ? 1.5 : 3,
        },
      ];
    });
  }

  private profiteerBonus(): [string, ScoreItem][] {
    let maxNames: string[] = [];
    let maxProfits = 0.001;
    for (const [name, player] of Object.entries(this.quizHost.players)) {
      if (!player.alive) continue;
      const profits = Object.values(player.challenges).reduce(
        (agg, challenge) =>
          challenge.type == "group-responder" ||
          challenge.type == "personal-delegate"
            ? agg + challenge.points
            : agg,
        0
      );
      if (profits > maxProfits) {
        maxNames = [name];
        maxProfits = profits;
      } else if (profits == maxProfits) {
        maxNames.push(name);
      }
    }
    return maxNames.map((name) => {
      return [
        name,
        {
          bonus: true,
          description: "The Profiteer",
          score: maxNames.length > 1 ? 1.5 : 3,
        },
      ];
    });
  }
}
