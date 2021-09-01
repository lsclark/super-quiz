import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

import {
  DSTargetAssignment,
  DSTargetMarking,
  USTargetSubmitMessage,
} from '../models/quiz-message-types';
import { TargetLetters, TargetResult } from '../quiz/target/message-types';
import { SessionService } from './session.service';
import { WebsocketService } from './websocket.service';

const EXPECTED = 3;

@Injectable({
  providedIn: 'root',
})
export class TargetService {
  assignments: { [key: string]: TargetLetters };
  results$?: Observable<TargetResult>;
  ready$ = new Subject<boolean>();
  ready: boolean = false;

  constructor(
    private websocketService: WebsocketService,
    private session: SessionService
  ) {
    this.assignments = {};
    this.subscribe();
  }

  subscribe() {
    if (!this.websocketService.messages$) this.websocketService.connect();
    let base$ = this.websocketService.messages$?.pipe(
      tap({
        error: (error) => console.log(`Connection error: ${error}`),
        complete: () => console.log('Connection closed'),
      })
    );

    this.results$ = base$?.pipe(
      filter((msg): msg is DSTargetMarking => {
        return msg.type == 'target_marking';
      }),
      map((msg) => {
        return {
          letters: msg.letters,
          submission: msg.submission,
          correct: msg.correct,
          score: msg.score,
        };
      })
    );

    base$
      ?.pipe(
        filter((msg): msg is DSTargetAssignment => {
          return msg.type == 'target_assignment';
        })
      )
      .subscribe((msg) => {
        let sorted = [msg.centre, ...msg.others].sort().join('');
        if (!(sorted in this.assignments))
          this.assignments[sorted] = {
            centre: msg.centre,
            others: msg.others,
            previous: msg.previous,
            initScore: msg.score,
          };
        if (Object.keys(this.assignments).length >= EXPECTED) {
          this.ready = true;
          this.ready$.next(true);
        }
      });
  }

  submit(letters: string, submission: string) {
    let data: USTargetSubmitMessage = {
      name: this.session.username,
      type: 'target_submit',
      letters: letters,
      submission: submission,
    };
    this.websocketService.send(data);
  }
}
