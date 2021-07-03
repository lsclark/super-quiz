import { Component } from '@angular/core';
import { QuestionsService } from '../../services/questions.service';
import { DisplayAnswer } from '../types';

@Component({
  selector: 'app-solutions',
  templateUrl: './solutions.component.html',
  styleUrls: ['./solutions.component.scss'],
})
export class SolutionsComponent {
  solutions: DisplayAnswer[];

  constructor(private questionService: QuestionsService) {
    this.solutions = [];
    questionService.playerState$?.subscribe((msg) => {
      this.solutions = msg.answers;
      console.log(this.solutions);
      this.solutions.sort((s1, s2) => s1.index - s2.index);
    });
  }
}
