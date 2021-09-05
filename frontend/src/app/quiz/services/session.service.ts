import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { USConnectMessage } from 'src/app/models/quiz-message-types';
import { WebsocketService } from 'src/app/services/websocket.service';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  username: string = '';
  registered: boolean = false;

  constructor(
    private cookies: CookieService,
    private websocket: WebsocketService
  ) {
    if (this.cookies.check('username')) {
      this.username = this.cookies.get('username');
      if (this.username) {
        this.registered = true;
        this.initialConnection();
      }
    }
  }

  initialConnection() {
    if (this.username) {
      let msg: USConnectMessage = { name: this.username, type: 'connect' };
      this.websocket.send(msg);
    }
  }

  register(username: string) {
    if (username) {
      this.username = username;
      this.cookies.set('username', username);
      this.registered = true;
      this.initialConnection();
    }
  }

  reportAlive() {
    this.websocket.send({
      type: 'connect',
      name: this.username,
    });
  }
}
