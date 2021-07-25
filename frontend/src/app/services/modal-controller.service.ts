import { Injectable } from '@angular/core';
import {
  NgbModal,
  NgbModalOptions,
  NgbModalRef,
} from '@ng-bootstrap/ng-bootstrap';
import { TimeoutWarningComponent } from '../general/timeout-warning/timeout-warning.component';
import { QuestionDisplay } from '../question-types';
import { GroupOriginatorComponent } from '../quiz/group/originator/originator.component';
import { PersonalOriginatorComponent } from '../quiz/personal/originator/originator.component';
import { SubmissionComponent } from '../quiz/submission/submission.component';

type SubmissionSpec = {
  type: 'submission';
  question: QuestionDisplay;
};

type TimeoutWarningSpec = {
  type: 'timeout-warning';
};

type GroupOriginSpec = {
  type: 'group-originator';
  question: QuestionDisplay;
};

type PersonalOriginSpec = {
  type: 'personal-originator';
  question: QuestionDisplay;
};

type ModalSpec =
  | SubmissionSpec
  | GroupOriginSpec
  | PersonalOriginSpec
  | TimeoutWarningSpec;

const DEFAULT_MODAL_OPTIONS: NgbModalOptions = {
  backdrop: 'static',
};

@Injectable({
  providedIn: 'root',
})
export class ModalControllerService {
  private stack: ModalSpec[];
  private topModal?: NgbModalRef;

  constructor(private modalService: NgbModal) {
    this.stack = [];
  }

  dismissTop() {
    this.topModal?.close();
    this.stack.pop();
    this.launchStackTop();
  }

  private launchStackTop() {
    if (this.stack.length) {
      let spec = this.stack[this.stack.length - 1];
      switch (spec.type) {
        case 'submission':
          this.makeSubmission(spec.question);
          break;
        case 'group-originator':
          this.makeGroupChallenge(spec.question);
          break;
        case 'personal-originator':
          this.makePersonalChallenge(spec.question);
          break;
        case 'timeout-warning':
          this.makeTimeoutWarning();
          break;
        default:
          break;
      }
    }
  }

  launchSubmission(question: QuestionDisplay) {
    this.topModal?.close();
    this.stack.push({
      type: 'submission',
      question: question,
    });
    this.makeSubmission(question);
  }

  launchTimeoutWarning() {
    this.topModal?.close();
    this.stack.push({
      type: 'timeout-warning',
    });
    this.makeTimeoutWarning();
  }

  launchGroupChallenge(question: QuestionDisplay) {
    this.topModal?.close();
    this.stack.push({
      type: 'group-originator',
      question: question,
    });
    this.makeGroupChallenge(question);
  }

  launchPersonalChallenge(question: QuestionDisplay) {
    this.topModal?.close();
    this.stack.push({
      type: 'personal-originator',
      question: question,
    });
    this.makePersonalChallenge(question);
  }

  private makeSubmission(question: QuestionDisplay) {
    let modalRef = this.modalService.open(
      SubmissionComponent,
      DEFAULT_MODAL_OPTIONS
    );
    modalRef.componentInstance.question = question;
    this.topModal = modalRef;
  }

  private makeGroupChallenge(question: QuestionDisplay) {
    let modalRef = this.modalService.open(
      GroupOriginatorComponent,
      DEFAULT_MODAL_OPTIONS
    );
    modalRef.componentInstance.question = question;
    this.topModal = modalRef;
  }

  private makePersonalChallenge(question: QuestionDisplay) {
    let modalRef = this.modalService.open(
      PersonalOriginatorComponent,
      DEFAULT_MODAL_OPTIONS
    );
    modalRef.componentInstance.question = question;
    this.topModal = modalRef;
  }

  private makeTimeoutWarning() {
    let modalRef = this.modalService.open(
      TimeoutWarningComponent,
      DEFAULT_MODAL_OPTIONS
    );
    this.topModal = modalRef;
  }
}
