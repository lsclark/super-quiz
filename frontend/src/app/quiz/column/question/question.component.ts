import { Component, Input } from '@angular/core';
import { QuestionsService } from '../../../services/questions.service';
import { AnswerState } from '../../types';

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
    questionService.playerState$?.subscribe((msg) => {
      let state = msg.questions[this.index];
      if (state !== null) {
        this.submitted = !(state === AnswerState.UnAnswered);
        if (state !== AnswerState.UnAnswered)
          this.correct = state == AnswerState.Correct;
        else this.correct = undefined;
      }
    });
  }
}
