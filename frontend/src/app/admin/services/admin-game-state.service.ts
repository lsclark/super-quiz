import { Injectable } from '@angular/core';
import { concat, from, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { WebsocketService } from 'src/app/services/websocket.service';
import {
  AdminDSPlayerState,
  AdminPlayer,
} from '../../models/admin-message-types';

@Injectable({
  providedIn: 'root',
})
export class AdminGameStateService {
  states: AdminPlayer[] = [];
  scores: [string, number][] = [];
  private updates$?: Observable<AdminPlayer[]>;

  constructor(private websocket: WebsocketService) {
    this.updates$ = this.websocket.messages$?.pipe(
      filter((msg): msg is AdminDSPlayerState => msg.type == 'adminState'),
      map((msg) => msg.statuses)
    );
    this.updates$?.subscribe((statuses) => {
      this.states = statuses;

      this.scores = statuses
        .map((playerData): [string, number] => [
          playerData.name,
          playerData.scores.reduce(
            (aggregate, scoreItem) => aggregate + scoreItem.score,
            0
          ),
        ])
        .sort(([, ascore], [, bscore]) => bscore - ascore);
    });
  }

  getPlayerState(name: string): Observable<AdminPlayer> | undefined {
    if (!this.updates$)
      return from(this.states.filter((player) => player.name == name));
    return concat(
      from(this.states.filter((player) => player.name == name)),
      this.updates$?.pipe(
        map((statuses) => statuses.find((status) => status.name == name)),
        filter((status): status is AdminPlayer => !!status)
      )
    );
  }
}
