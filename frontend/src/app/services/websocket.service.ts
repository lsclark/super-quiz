import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, share } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { DSTimeoutMessage, QuizMessage } from '../quiz/types';
import { ModalControllerService } from './modal-controller.service';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  url: string = 'ws://localhost:8080/';
  private connection$?: WebSocketSubject<QuizMessage>;
  messages$?: Observable<QuizMessage>;

  constructor(
    private session: SessionService,
    private modalController: ModalControllerService
  ) {
    this.connect();

    this.messages$
      ?.pipe(
        filter((msg): msg is DSTimeoutMessage => {
          return msg.type == 'timeout';
        })
      )
      .subscribe(() => {
        this.modalController.launchTimeoutWarning();
      });
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
