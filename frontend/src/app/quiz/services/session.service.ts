import { Injectable } from "@angular/core";
import { CookieService } from "ngx-cookie-service";
import { BehaviorSubject } from "rxjs";
import { USConnectMessage } from "src/app/models/quiz-message-types";
import { WebsocketService } from "src/app/services/websocket.service";

@Injectable({
  providedIn: "root",
})
export class SessionService {
  username = "";
  registered$ = new BehaviorSubject<boolean>(false);

  constructor(
    private cookies: CookieService,
    private websocket: WebsocketService
  ) {
    if (this.cookies.check("username")) {
      this.username = this.cookies.get("username");
      if (this.username) {
        this.registered$.next(true);
        this.initialConnection();
      }
    }
  }

  initialConnection(): void {
    if (this.username) {
      const msg: USConnectMessage = { name: this.username, type: "connect" };
      this.websocket.send(msg);
    }
  }

  register(username: string): void {
    if (username) {
      this.username = username;
      this.cookies.set("username", username);
      this.registered$.next(true);
      this.initialConnection();
    }
  }

  reportAlive(): void {
    this.websocket.send({
      type: "connect",
      name: this.username,
    });
  }
}
