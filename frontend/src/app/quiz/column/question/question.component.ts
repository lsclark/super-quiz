import { Component, Input } from '@angular/core';
import { QuestionsService } from '../../../services/questions.service';
import { QuestionState } from '../../types';

@Component({
  selector: 'app-quiz-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss'],
})
export class QuestionComponent {
  @Input() index!: number;
  @Input() text!: string;
  submitted?: boolean;
  correct?: boolean;

  constructor(private questionService: QuestionsService) {
    questionService.states$?.subscribe((msg) => {
      let state = msg[this.index];
      if (state !== null) {
        this.submitted = !(state === QuestionState.UnAnswered);
        if (state !== QuestionState.UnAnswered)
          this.correct = state == QuestionState.Correct;
        else this.correct = undefined;
      }
    });
  }
}
