import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import {
  DSPlayerStatusMessage,
  DSScoreboardMessage,
  PlayerState,
} from '../../models/quiz-message-types';
import { WebsocketService } from '../../services/websocket.service';
import { SessionService } from './session.service';
import { GroupChallengeService } from './group-challenge.service';
import { PersonalChallengeService } from './personal-challenge.service';

@Injectable({
  providedIn: 'root',
})
export class PlayersService {
  score: number;
  others: string[];
  playerState$?: Observable<PlayerState>;
  scoreboard$?: Observable<DSScoreboardMessage>;

  constructor(
    private websocketService: WebsocketService,
    private session: SessionService,
    // Define challenge services so they enter memory
    groupChallenge: GroupChallengeService,
    personalChallenge: PersonalChallengeService
  ) {
    this.others = [];
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
      })
    );
    this.scoreboard$?.subscribe((msg) => {
      this.score = msg.score;
    });
    this.scoreboard$?.pipe(map((msg) => msg.scores)).subscribe((msg) => {
      this.others = msg
        .filter((scoreobj) => scoreobj.name != this.session.username)
        .map((scoreobj) => scoreobj.name);
    });
  }
}
