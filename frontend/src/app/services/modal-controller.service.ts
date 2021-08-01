import { Component, Injectable } from '@angular/core';
import {
  NgbModal,
  NgbModalOptions,
  NgbModalRef,
} from '@ng-bootstrap/ng-bootstrap';
import { NotificationComponent } from '../general/notification/notification.component';
import { QuestionDisplay } from '../message-types';
import { GroupChallengedComponent } from '../quiz/group/challenged/challenged.component';
import { GroupOriginatorComponent } from '../quiz/group/originator/originator.component';
import { PersonalDelegatedComponent } from '../quiz/personal/delegated/delegated.component';
import { PersonalOriginatorComponent } from '../quiz/personal/originator/originator.component';
import { SubmissionComponent } from '../quiz/submission/submission.component';
import { WebsocketService } from './websocket.service';

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

  constructor(
    private modalService: NgbModal,
    // private session: SessionService,
    private websocketService: WebsocketService
  ) {
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
          this.makeGroupChallengeOrigin(spec.question);
          break;
        case 'personal-originator':
          this.makePersonalChallengeOrigin(spec.question);
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

  launchGroupChallengeOrigin(question: QuestionDisplay) {
    this.topModal?.close();
    this.stack.push({
      type: 'group-originator',
      question: question,
    });
    this.makeGroupChallengeOrigin(question);
  }

  launchGroupChallengeDistribute(
    question: QuestionDisplay,
    origin: string,
    wager: number
  ) {
    this.topModal?.close();
    this.stack.push({
      type: 'group-originator',
      question: question,
    });
    this.makeGroupChallengeDistribute(question, origin, wager);
  }

  launchGroupChallengeOutcome(
    question: QuestionDisplay,
    originator: string,
    victor: string | null,
    answer: string
  ) {
    this.topModal?.close();
    this.stack.push({
      type: 'group-originator',
      question: question,
    });
    this.makeGroupChallengeOutcome(question, originator, victor, answer);
  }

  launchPersonalChallengeOrigin(question: QuestionDisplay) {
    this.topModal?.close();
    this.stack.push({
      type: 'personal-originator',
      question: question,
    });
    this.makePersonalChallengeOrigin(question);
  }

  launchPersonalChallengeDelegate(
    question: QuestionDisplay,
    originator: string
  ) {
    this.topModal?.close();
    this.stack.push({
      type: 'personal-originator',
      question: question,
    });
    this.makePersonalChallengeDelegate(question, originator);
  }

  launchPersonalChallengeOutcome(
    question: QuestionDisplay,
    originator: string,
    delegate: string,
    answer: string,
    success: boolean
  ) {
    this.topModal?.close();
    this.stack.push({
      type: 'group-originator',
      question: question,
    });
    this.makePersonalChallengeOutcome(
      question,
      originator,
      delegate,
      answer,
      success
    );
  }

  private makeSubmission(question: QuestionDisplay) {
    let modalRef = this.modalService.open(
      SubmissionComponent,
      DEFAULT_MODAL_OPTIONS
    );
    modalRef.componentInstance.question = question;
    this.topModal = modalRef;
  }

  private makeGroupChallengeOrigin(question: QuestionDisplay) {
    let modalRef = this.modalService.open(
      GroupOriginatorComponent,
      DEFAULT_MODAL_OPTIONS
    );
    modalRef.componentInstance.question = question;
    this.topModal = modalRef;
  }

  private makeGroupChallengeDistribute(
    question: QuestionDisplay,
    origin: string,
    wager: number
  ) {
    let modalRef = this.modalService.open(
      GroupChallengedComponent,
      DEFAULT_MODAL_OPTIONS
    );
    modalRef.componentInstance.question = question;
    modalRef.componentInstance.player = origin;
    modalRef.componentInstance.wager = wager;
    this.topModal = modalRef;
  }

  private makeGroupChallengeOutcome(
    question: QuestionDisplay,
    originator: string,
    victor: string | null,
    answer: string
  ) {
    let modalRef = this.modalService.open(
      NotificationComponent,
      DEFAULT_MODAL_OPTIONS
    );
    modalRef.componentInstance.title = 'GROUP OUTCOME';
    modalRef.componentInstance.body =
      "It's been a while since you've done anything. Are you still there?";
    modalRef.componentInstance.button = "I'm here!";
    modalRef.componentInstance.button_cb = this.websocketService.reportAlive;
    this.topModal = modalRef;
  }

  private makePersonalChallengeOrigin(question: QuestionDisplay) {
    let modalRef = this.modalService.open(
      PersonalOriginatorComponent,
      DEFAULT_MODAL_OPTIONS
    );
    modalRef.componentInstance.question = question;
    this.topModal = modalRef;
  }

  private makePersonalChallengeDelegate(
    question: QuestionDisplay,
    originator: string
  ) {
    let modalRef = this.modalService.open(
      PersonalDelegatedComponent,
      DEFAULT_MODAL_OPTIONS
    );
    modalRef.componentInstance.question = question;
    modalRef.componentInstance.origin = originator;
    this.topModal = modalRef;
  }

  private makePersonalChallengeOutcome(
    question: QuestionDisplay,
    originator: string,
    delegate: string,
    answer: string,
    success: boolean
  ) {
    let modalRef = this.modalService.open(
      NotificationComponent,
      DEFAULT_MODAL_OPTIONS
    );
    modalRef.componentInstance.title = 'PERSONAL OUTCOME';
    modalRef.componentInstance.body =
      "It's been a while since you've done anything. Are you still there?";
    modalRef.componentInstance.button = "I'm here!";
    modalRef.componentInstance.button_cb = this.websocketService.reportAlive;
    this.topModal = modalRef;
    if (!!modalRef) this.topModal = modalRef;
  }

  private makeTimeoutWarning() {
    let modalRef = this.modalService.open(
      NotificationComponent,
      DEFAULT_MODAL_OPTIONS
    );
    modalRef.componentInstance.title = 'Wake Up';
    modalRef.componentInstance.body =
      "It's been a while since you've done anything. Are you still there?";
    modalRef.componentInstance.button = "I'm here!";
    modalRef.componentInstance.button_cb = this.websocketService.reportAlive;
    this.topModal = modalRef;
  }

  private make();
}
