import { Component } from '@angular/core';
import { PlayerScore } from 'src/app/message-types';
import { PlayersService } from 'src/app/services/players.service';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-scores',
  templateUrl: './scores.component.html',
  styleUrls: ['./scores.component.scss'],
})
export class ScoresComponent {
  players: PlayerScore[];

  constructor(
    public playerService: PlayersService,
    public session: SessionService
  ) {
    this.players = [];
    this.playerService.scoreboard$?.subscribe((msg) => {
      this.players = msg;
      this.players.sort(
        (p1: PlayerScore, p2: PlayerScore) => p1.score - p2.score
      );
    });
  }
}
