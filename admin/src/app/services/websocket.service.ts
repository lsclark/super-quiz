import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { share } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { AdminMessage, AdminUSConnect } from '../message-types';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  url: string = 'ws://localhost:8080/';
  private connection$?: WebSocketSubject<AdminMessage>;
  messages$?: Observable<AdminMessage>;

  constructor(private session: SessionService) {
    this.session.registration$.subscribe(() => this.connect());
    if (this.session.registered) this.connect();
  }

  connect() {
    if (!this.connection$ || this.connection$.closed) {
      this.connection$ = webSocket(this.url);
      this.messages$ = this.connection$.pipe(share());
      let connectMsg: AdminUSConnect = {
        admin: true,
        type: 'adminConnect',
        auth: this.session.token,
      };
      this.send(connectMsg);
    }
  }

  send(message: AdminMessage): void {
    if (this.connection$) {
      console.log('SENDING', message);
      this.connection$.next(message);
    }
  }

  closeConnection(): void {
    if (this.connection$) {
      this.connection$.complete();
      this.connection$ = undefined;
      this.messages$ = undefined;
    }
  }

  ngOnDestroy() {
    console.log('Websocket Service Destroyed');
    this.closeConnection();
  }
}
