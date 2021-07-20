import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import {
  DSPlayerStatusMessage,
  DSScoreboardMessage,
  PlayerState,
} from '../quiz/types';
import { PlayerScore } from '../question-types';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root',
})
export class PlayersService {
  name: string;
  score: number;
  playerState$?: Observable<PlayerState>;
  scoreboard$?: Observable<PlayerScore[]>;

  constructor(private websocketService: WebsocketService) {
    this.name = 'testname';
    this.score = 0;
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
    this.scoreboard$?.subscribe((msg) => {
      msg
        .filter((scoreobj) => scoreobj.name == this.name)
        .forEach((scoreobj) => (this.score = scoreobj.score));
    });
  }
}
