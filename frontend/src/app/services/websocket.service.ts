import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { share } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { AdminMessage } from '../models/admin-message-types';
import { QuizMessage } from '../models/quiz-message-types';
import { SessionService } from '../quiz/services/session.service';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  url: string = 'ws://localhost:8080/';
  private connection$?: WebSocketSubject<QuizMessage | AdminMessage>;
  messages$?: Observable<QuizMessage | AdminMessage>;

  constructor(private session: SessionService) {
    this.connect();
    if (this.session.registered) this.register();
    this.session.registration$.subscribe(() => this.register());
  }

  connect() {
    if (!this.connection$ || this.connection$.closed) {
      this.connection$ = webSocket(this.url);
      this.messages$ = this.connection$.pipe(share());
    }
  }

  register() {
    this.send({ name: this.session.username, type: 'connect' });
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
