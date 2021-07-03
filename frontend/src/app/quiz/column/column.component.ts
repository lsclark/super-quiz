import { Component, EventEmitter, Input, Output } from '@angular/core';
import { QuestionDisplay } from '../../question-types';
import { QuestionsService } from '../../services/questions.service';
import { AnswerState } from '../types';

const getEntries = Object.entries as <T extends object>(
  obj: T
) => Array<[keyof T, T[keyof T]]>;

@Component({
  selector: 'app-quiz-column',
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.scss'],
})
export class ColumnComponent {
  @Input() questions!: QuestionDisplay[];
  @Input() points!: number;
  submitted: Set<number | string>;

  @Output() selectQuestionEvent = new EventEmitter<number>();

  constructor(private questionService: QuestionsService) {
    this.submitted = new Set<number | string>();
    questionService.playerState$?.subscribe((msg) => {
      for (let [index, state] of getEntries(msg.questions)) {
        if (!this.submitted.has(index) && state !== AnswerState.UnAnswered)
          this.submitted.add(index);
      }
    });
  }

  clickQuestion(index: number) {
    console.log(index, typeof index, this.submitted, index in this.submitted);
    if (!this.submitted.has(index) && !this.submitted.has((+index).toString()))
      this.selectQuestionEvent.emit(index);
  }
}
