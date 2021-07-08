import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { QuestionDisplay } from '../../question-types';
import { QuestionsService } from '../../services/questions.service';
import { SubmissionComponent } from '../submission/submission.component';
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

  constructor(
    private questionService: QuestionsService,
    private modalService: NgbModal
  ) {
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
    if (
      !this.submitted.has(index) &&
      !this.submitted.has((+index).toString())
    ) {
      let modalRef = this.modalService.open(SubmissionComponent);
      let questions = this.questions.filter((q) => q.index == index);
      modalRef.componentInstance.question = questions[0];
      modalRef.componentInstance.setSaved();
    }
  }
}
