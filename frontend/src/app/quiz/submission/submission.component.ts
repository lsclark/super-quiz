import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { QuestionsService } from 'src/app/services/questions.service';
import { SaveResponsesService } from 'src/app/services/save-responses.service';
import { QuestionDisplay } from '../../question-types';

@Component({
  selector: 'app-quiz-submission',
  templateUrl: './submission.component.html',
  styleUrls: ['./submission.component.scss'],
})
export class SubmissionComponent {
  @Input() question!: QuestionDisplay;
  response = new FormControl('');
  multiChoice: number = -1;

  constructor(
    private questionService: QuestionsService,
    public activeModal: NgbActiveModal,
    private saveService: SaveResponsesService
  ) {}

  responseChanged() {
    this.saveService.set(this.question.index, this.response.value);
  }

  setSaved() {
    let saved = this.saveService.get(this.question.index);
    if (typeof saved == 'string') this.response.setValue(saved);
    if (typeof saved == 'number') this.multiChoice = saved;
  }

  selectChoice(event: number) {
    console.log(event);
    this.saveService.set(this.question.index, event);
    this.multiChoice = event;
  }

  submit() {
    this.questionService.submitAnswer(this.question.index, this.response.value);
    this.activeModal.dismiss();
  }
}
