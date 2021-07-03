import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import {
  DSPlayerStatusMessage,
  DSQuestionsMessage,
  DSScoreboardMessage,
  PlayerState,
} from '../quiz/types';
import { PlayerScore, QuestionColumn, Solution } from '../question-types';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root',
})
export class QuestionsService {
  questions$?: Observable<QuestionColumn[]>;
  playerState$?: Observable<PlayerState>;
  scoreboard$?: Observable<PlayerScore[]>;

  constructor(private websocketService: WebsocketService) {
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
    this.playerState$ = base$?.pipe(
      filter((msg): msg is DSPlayerStatusMessage => {
        return msg.type == 'player_status';
      }),
      map((msg) => {
        return msg.status;
      })
    );
    this.scoreboard$ = base$?.pipe(
      filter((msg): msg is DSScoreboardMessage => {
        return msg.type == 'scoreboard';
      }),
      map((msg) => msg.scores)
    );
    this.questions$ = base$?.pipe(
      filter((msg): msg is DSQuestionsMessage => {
        return msg.type == 'questions';
      }),
      map((msg) => msg.questions)
    );
  }

  submitAnswer(index: number, solution: number | string) {
    this.websocketService.send({
      name: 'testname',
      type: 'submission',
      index: index,
      submission: solution,
    });
  }
}
