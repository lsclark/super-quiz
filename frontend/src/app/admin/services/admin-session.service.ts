import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import {
  AdminMessage,
  AdminUSConnect,
} from 'src/app/models/admin-message-types';
import { WebsocketService } from 'src/app/services/websocket.service';

@Injectable({
  providedIn: 'root',
})
export class AdminSessionService {
  token: string = '';
  registered: boolean = false;
  registration$ = new Subject<boolean>();

  constructor(private websocket: WebsocketService) {
    this.websocket.messages$
      ?.pipe(filter((msg): msg is AdminMessage => 'admin' in msg))
      .subscribe(() => {
        this.registered = true;
        this.registration$.next(true);
      });
  }

  register(token: string) {
    this.token = token;
    let message: AdminUSConnect = {
      admin: true,
      type: 'adminConnect',
      auth: this.token,
    };
    this.websocket.send(message);
  }
}
