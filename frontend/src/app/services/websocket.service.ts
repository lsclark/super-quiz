import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { share } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { QuizMessage } from '../message-types';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  url: string = 'ws://localhost:8080/';
  private connection$?: WebSocketSubject<QuizMessage>;
  messages$?: Observable<QuizMessage>;

  constructor(private session: SessionService) {
    this.connect();
  }

  connect() {
    if (!this.connection$ || this.connection$.closed) {
      this.connection$ = webSocket(this.url);
      this.messages$ = this.connection$.pipe(share());
      this.send({ name: this.session.username, type: 'connect' });
    }
  }

  send(message: QuizMessage): void {
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

  reportAlive() {
    this.send({
      type: 'connect',
      name: this.session.username,
    });
  }
}
