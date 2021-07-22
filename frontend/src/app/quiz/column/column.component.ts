import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { QuestionDisplay } from '../../question-types';
import { QuestionsService } from '../../services/questions.service';
import { SubmissionComponent } from '../submission/submission.component';

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
    private modalService: NgbModal
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
      let modalRef = this.modalService.open(SubmissionComponent);
      let questions = this.questions.filter((q) => q.index == index);
      modalRef.componentInstance.question = questions[0];
      modalRef.componentInstance.setSaved();
    }
  }
}
