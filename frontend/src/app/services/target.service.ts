import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

import {
  DSTargetAssignment,
  DSTargetMarking,
  USTargetSubmitMessage,
} from '../quiz/types';
import { TargetLetters, TargetResult } from '../target/message-types';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root',
})
export class TargetService {
  assignments: { [key: string]: TargetLetters };
  results$?: Observable<TargetResult>;

  constructor(private websocketService: WebsocketService) {
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
        };
      })
    );

    base$
      ?.pipe(
        filter((msg): msg is DSTargetAssignment => {
          return msg.type == 'target_assignment';
        }),
        map((msg) => {
          return {
            centre: msg.centre,
            others: msg.others,
            previous: msg.previous,
          };
        })
      )
      .subscribe((msg) => {
        let sorted = [msg.centre, ...msg.others].sort().join('');
        this.assignments[sorted] = {
          centre: msg.centre,
          others: msg.others,
          previous: msg.previous,
        };
      });
  }

  submit(letters: string, submission: string) {
    let data: USTargetSubmitMessage = {
      name: 'testname',
      type: 'target_submit',
      letters: letters,
      submission: submission,
    };
    this.websocketService.send(data);
  }
}
