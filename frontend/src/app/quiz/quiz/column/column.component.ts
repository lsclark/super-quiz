import { Component, Input } from '@angular/core';

import { QuestionDisplay } from '../../../models/quiz-message-types';
import { QuestionsService } from '../../services/questions.service';

@Component({
  selector: 'app-quiz-column',
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.scss'],
})
export class ColumnComponent {
  @Input() questions!: QuestionDisplay[];
  @Input() points!: number;

  constructor(private questionService: QuestionsService) {}

  clickQuestion(index: number) {
    console.log(
      index,
      typeof index,
      this.questionService.submitted,
      index in this.questionService.submitted
    );
    if (
      !this.questionService.submitted.has(index) &&
      !this.questionService.submitted.has((+index).toString())
    ) {
      let question = this.questions.find((q) => q.index == index);
      if (!!question) this.questionService.launchSubmission(question);
    }
  }
}