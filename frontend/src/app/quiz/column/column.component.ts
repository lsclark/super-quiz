import { Component, Input } from '@angular/core';

import { ModalControllerService } from 'src/app/services/modal-controller.service';
import { QuestionDisplay } from '../../question-types';
import { QuestionsService } from '../../services/questions.service';

@Component({
  selector: 'app-quiz-column',
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.scss'],
})
export class ColumnComponent {
  @Input() questions!: QuestionDisplay[];
  @Input() points!: number;

  constructor(
    private questionService: QuestionsService,
    private modalController: ModalControllerService
  ) {}

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
      let questions = this.questions.filter((q) => q.index == index);
      this.modalController.launchSubmission(questions[0]);
    }
  }
}
