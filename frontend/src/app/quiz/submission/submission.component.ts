import { Component, Input, OnInit } from '@angular/core';

import { ModalControllerService } from 'src/app/services/modal-controller.service';
import { QuestionsService } from 'src/app/services/questions.service';
import { SaveResponsesService } from 'src/app/services/save-responses.service';
import { QuestionDisplay } from '../../question-types';

@Component({
  selector: 'app-quiz-submission',
  templateUrl: './submission.component.html',
  styleUrls: ['./submission.component.scss'],
})
export class SubmissionComponent implements OnInit {
  @Input() question!: QuestionDisplay;
  response: string = '';
  multiChoice: number = -1;

  constructor(
    private modalController: ModalControllerService,
    private questionService: QuestionsService,
    private saveService: SaveResponsesService
  ) {}

  ngOnInit(): void {
    this.restoreSaved();
  }

  responseChanged() {
    this.saveService.set(this.question.index, this.response);
  }

  restoreSaved() {
    let saved = this.saveService.get(this.question.index);
    if (typeof saved == 'string') this.response = saved;
    if (typeof saved == 'number') this.multiChoice = saved;
  }

  selectChoice(event: number) {
    console.log(event);
    this.saveService.set(this.question.index, event);
    this.multiChoice = event;
  }

  dismiss() {
    this.modalController.dismissTop();
  }

  submit() {
    this.questionService.submitAnswer(this.question.index);
    this.modalController.dismissTop();
  }

  groupChallenge() {
    this.modalController.launchGroupChallenge(this.question);
  }

  personalChallenge() {
    this.modalController.launchPersonalChallenge(this.question);
  }
}
