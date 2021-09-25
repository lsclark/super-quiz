import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { share } from "rxjs/operators";
import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import { environment } from "src/environments/environment";
import { AdminMessage } from "../models/admin-message-types";
import { QuizMessage } from "../models/quiz-message-types";

@Injectable({
  providedIn: "root",
})
export class WebsocketService {
  private port = environment.production
    ? window.location.port
    : environment.wsPort;
  private protocol = environment.production ? "wss" : "ws";
  url = `${this.protocol}://${window.location.hostname}:${this.port}/`;
  private connection$?: WebSocketSubject<QuizMessage | AdminMessage>;
  messages$?: Observable<QuizMessage | AdminMessage>;

  constructor() {
    this.connect();
  }

  connect(): void {
    if (!this.connection$ || this.connection$.closed) {
      this.connection$ = webSocket(this.url);
      this.messages$ = this.connection$.pipe(share());
    }
  }

  send(message: QuizMessage | AdminMessage): void {
    if (this.connection$) {
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

  ngOnDestroy(): void {
    this.closeConnection();
  }
}
