import { Injectable } from '@angular/core';
import { filter } from 'rxjs/operators';
import { AdminDSPlayerState, AdminPlayer } from '../message-types';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root',
})
export class GameStateService {
  states: AdminPlayer[] = [];

  constructor(private websocket: WebsocketService) {
    websocket.messages$
      ?.pipe(
        filter((msg): msg is AdminDSPlayerState => msg.type == 'adminState')
      )
      .subscribe((msg) => {
        this.states = msg.statuses;
      });
  }
}
