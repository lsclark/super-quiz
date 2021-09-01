import { Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { PlayerScore, ScoreItem } from 'src/app/models/quiz-message-types';
import { PlayersService } from 'src/app/services/players.service';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-scores',
  templateUrl: './scores.component.html',
  styleUrls: ['./scores.component.scss'],
})
export class ScoresComponent {
  players: PlayerScore[] = [];
  scoreItems: ScoreItem[] = [];
  place: number = 0;

  constructor(
    public playerService: PlayersService,
    public session: SessionService
  ) {
    this.playerService.scoreboard$
      ?.pipe(map((msg) => msg.scores))
      .subscribe((msg) => {
        this.players = msg;
        this.players.sort(
          (p1: PlayerScore, p2: PlayerScore) => p1.score - p2.score
        );
        this.place = (this.players
          .map((val, idx): [string, number] => [val.name, idx])
          .find(([val]) => val == this.session.username) ?? [0, 0])[1];
      });
    this.playerService.scoreboard$
      ?.pipe(map((msg) => msg.breakdown))
      .subscribe((msg) => {
        this.scoreItems = msg;
        this.scoreItems.sort((a, b) => b.score - a.score);
      });
  }

  placeToWords(place: number): string {
    const words = [
      'first',
      'second',
      'third',
      'fourth',
      'fifth',
      'sixth',
      'seventh',
      'eighth',
      'ninth',
      'tenth',
      'eleventh',
      'twelfth',
      'thirteenth',
      'fourteenth',
      'fifteenth',
      'sixteenth',
      'seventeenth',
      'eighteenth',
      'nineteenth',
      'twentieth',
    ];
    if (place < 20) return words[place];
    else return 'Unknown';
  }
}
