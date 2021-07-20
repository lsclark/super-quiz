import { Component } from '@angular/core';
import { PlayerScore } from 'src/app/question-types';
import { PlayersService } from 'src/app/services/players.service';

@Component({
  selector: 'app-scores',
  templateUrl: './scores.component.html',
  styleUrls: ['./scores.component.scss'],
})
export class ScoresComponent {
  players: PlayerScore[];

  constructor(public playerService: PlayersService) {
    this.players = [];
    this.playerService.scoreboard$?.subscribe((msg) => {
      this.players = msg;
      this.players.sort(
        (p1: PlayerScore, p2: PlayerScore) => p1.score - p2.score
      );
    });
  }
}
