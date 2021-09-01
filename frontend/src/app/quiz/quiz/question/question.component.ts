import { AfterViewInit, Component, Input } from '@angular/core';
import { QuestionsService } from '../../services/questions.service';
import { QuestionState } from '../../../models/quiz-message-types';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-quiz-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss'],
})
export class QuestionComponent implements AfterViewInit {
  @Input() index!: number;
  @Input() text!: string;
  submitted?: boolean;
  correct?: boolean;
  incorrect?: boolean;
  delegated?: boolean;

  constructor(private questionService: QuestionsService) {
    this.questionService.states$
      ?.pipe(
        filter(([idx]) => this.index == idx),
        map(([, state]) => state)
      )
      .subscribe((state) => {
        if (state !== null) {
          this.update(state);
        }
      });
  }

  ngAfterViewInit(): void {
    let state = this.questionService.states[this.index];
    if (!!state) this.update(state);
  }

  update(state: QuestionState) {
    this.submitted = !(state === QuestionState.UnAnswered);
    if (state !== QuestionState.UnAnswered) {
      this.correct = state == QuestionState.Correct;
      this.incorrect = state == QuestionState.Incorrect;
      this.delegated =
        state == QuestionState.DelegatedPending ||
        state == QuestionState.DelegatedComplete;
    } else this.correct = this.incorrect = this.delegated = undefined;
  }
}
