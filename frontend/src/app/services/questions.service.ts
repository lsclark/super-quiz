import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import {
  QuestionState,
  DSPlayerStatusMessage,
  DSQuestionsMessage,
  DisplayAnswer,
  QuestionDisplay,
} from '../models/quiz-message-types';
import { QuestionColumn } from '../models/quiz-message-types';
import { WebsocketService } from './websocket.service';
import { SessionService } from './session.service';
import { SaveResponsesService } from './save-responses.service';
import { ModalControllerService, ModalSpec } from './modal-controller.service';
import { SubmissionComponent } from '../quiz/quiz/submission/submission.component';

const getEntries = Object.entries as <T extends object>(
  obj: T
) => Array<[keyof T, T[keyof T]]>;

@Injectable({
  providedIn: 'root',
})
export class QuestionsService {
  states$ = new Subject<[number, QuestionState]>();
  ready$ = new Subject<boolean>();

  questions: QuestionColumn[] = [];
  answers: DisplayAnswer[] = [];
  states: { [index: number]: QuestionState } = {};
  submitted = new Set<number | string>();
  ready: boolean = false;

  constructor(
    private websocketService: WebsocketService,
    private saveService: SaveResponsesService,
    private modalController: ModalControllerService,
    private session: SessionService
  ) {
    this.subscribe();
  }

  subscribe() {
    if (!this.websocketService.messages$) this.websocketService.connect();
    let base$ = this.websocketService.messages$?.pipe(
      tap({
        next: (msg) => console.log(`Received: ${msg.type}`),
        error: (error) => console.log(`Connection error: ${error}`),
        complete: () => console.log('Connection closed'),
      })
    );
    base$
      ?.pipe(
        filter((msg): msg is DSPlayerStatusMessage => {
          return msg.type == 'player_status';
        }),
        map((msg) => msg.status.questions)
      )
      .subscribe((msg) => {
        this.states = msg;
        for (let [index, state] of getEntries(msg)) {
          this.states$.next([index, state]);
          if (!this.submitted.has(index) && state !== QuestionState.UnAnswered)
            this.submitted.add(index);
        }
      });
    base$
      ?.pipe(
        filter((msg): msg is DSQuestionsMessage => {
          return msg.type == 'questions';
        }),
        map((msg) => msg.questions)
      )
      .subscribe((cols) => {
        this.questions = cols;

        this.ready = true;
        this.ready$.next(true);
      });

    base$
      ?.pipe(
        filter((msg): msg is DSPlayerStatusMessage => {
          return msg.type == 'player_status';
        }),
        map((msg) => msg.status.answers)
      )
      .subscribe((msg) => {
        this.answers = msg;
        console.log(this.answers);
        this.answers.sort((s1, s2) => s1.index - s2.index);
      });
  }

  launchSubmission(question: QuestionDisplay) {
    let spec: ModalSpec = {
      component: SubmissionComponent,
      identifier: question.index,
      inputs: { question: question },
    };
    this.modalController.launch(spec);
  }

  submitAnswer(index: number) {
    let response = this.saveService.get(index);
    if (
      (typeof response == 'string' && response.length) ||
      (typeof response == 'number' && response >= 0)
    )
      this.websocketService.send({
        name: this.session.username,
        type: 'submission',
        index: index,
        submission: response,
      });
  }
}
