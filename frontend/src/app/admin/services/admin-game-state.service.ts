import { Injectable } from '@angular/core';
import { filter } from 'rxjs/operators';
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

  constructor(private websocket: WebsocketService) {
    this.websocket.messages$
      ?.pipe(
        filter((msg): msg is AdminDSPlayerState => msg.type == 'adminState')
      )
      .subscribe((msg) => {
        this.states = msg.statuses;
      });
  }
}
