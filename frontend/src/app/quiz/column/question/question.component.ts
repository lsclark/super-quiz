import { Component, Input } from '@angular/core';
import { QuestionsService } from '../../../services/questions.service';
import { QuestionState } from '../../../message-types';

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
  incorrect?: boolean;
  delegated?: boolean;

  constructor(private questionService: QuestionsService) {
    this.questionService.states$?.subscribe((msg) => {
      let state = msg[this.index];
      if (state !== null) {
        this.submitted = !(state === QuestionState.UnAnswered);
        if (state !== QuestionState.UnAnswered) {
          this.correct = state == QuestionState.Correct;
          this.incorrect = state == QuestionState.Incorrect;
          this.delegated =
            state == QuestionState.DelegatedPending ||
            state == QuestionState.DelegatedComplete;
        } else this.correct = this.incorrect = this.delegated = undefined;
      }
    });
  }
}
