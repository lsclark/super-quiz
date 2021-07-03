import { Component } from '@angular/core';
import { PlayerScore } from 'src/app/question-types';
import { QuestionsService } from 'src/app/services/questions.service';

@Component({
  selector: 'app-scores',
  templateUrl: './scores.component.html',
  styleUrls: ['./scores.component.scss'],
})
export class ScoresComponent {
  players: PlayerScore[];

  constructor(private questionService: QuestionsService) {
    this.players = [];
    this.questionService.scoreboard$?.subscribe((msg) => {
      this.players = msg;
      this.players.sort(
        (p1: PlayerScore, p2: PlayerScore) => p1.score - p2.score
      );
    });
  }
}
