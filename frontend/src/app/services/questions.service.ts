import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import {
  QuestionState,
  DSPlayerStatusMessage,
  DSQuestionsMessage,
  DisplayAnswer,
} from '../quiz/types';
import { QuestionColumn } from '../question-types';
import { WebsocketService } from './websocket.service';
import { SessionService } from './session.service';
import { SaveResponsesService } from './save-responses.service';

const getEntries = Object.entries as <T extends object>(
  obj: T
) => Array<[keyof T, T[keyof T]]>;

@Injectable({
  providedIn: 'root',
})
export class QuestionsService {
  questions$?: Observable<QuestionColumn[]>;
  answers: DisplayAnswer[];
  states$?: Observable<{ [index: number]: QuestionState }>;
  submitted: Set<number | string>;

  constructor(
    private websocketService: WebsocketService,
    private saveService: SaveResponsesService,
    private session: SessionService
  ) {
    this.answers = [];
    this.submitted = new Set<number | string>();
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
    this.states$ = base$?.pipe(
      filter((msg): msg is DSPlayerStatusMessage => {
        return msg.type == 'player_status';
      }),
      map((msg) => msg.status.questions)
    );
    this.states$?.subscribe((msg) => {
      for (let [index, state] of getEntries(msg)) {
        if (!this.submitted.has(index) && state !== QuestionState.UnAnswered)
          this.submitted.add(index);
      }
    });
    this.questions$ = base$?.pipe(
      filter((msg): msg is DSQuestionsMessage => {
        return msg.type == 'questions';
      }),
      map((msg) => msg.questions)
    );

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

  submitAnswer(index: number) {
    let response = this.saveService.get(index);
    if (
      (typeof response == 'string' && response.length) ||
      (typeof response == 'number' && response > 0)
    )
      this.websocketService.send({
        name: this.session.username,
        type: 'submission',
        index: index,
        submission: response,
      });
  }
}
