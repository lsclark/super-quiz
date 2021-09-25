import { Component } from "@angular/core";
import { Observable, timer } from "rxjs";
import {
  AdminUSChallengeStart,
  AdminUSGameControl,
  AdminUSTerminate,
} from "src/app/models/admin-message-types";
import { WebsocketService } from "src/app/services/websocket.service";

import { AdminGameStateService } from "../services/admin-game-state.service";
import { AdminSessionService } from "../services/admin-session.service";

const TERMINATION_TIME = 5 * 1000;
const TERMINATION_CLICKS = 3;

@Component({
  selector: "app-admin-main",
  templateUrl: "./main.component.html",
  styleUrls: ["./main.component.scss"],
})
export class MainComponent {
  termClicks = 0;
  private termTimer?: Observable<number>;

  constructor(
    public gameStateService: AdminGameStateService,
    private session: AdminSessionService,
    private websocket: WebsocketService
  ) {}

  gameState(state: "start" | "stop"): void {
    const msg: AdminUSGameControl = {
      admin: true,
      type: "adminGameControl",
      auth: this.session.token,
      state: state,
    };
    this.websocket.send(msg);
  }

  startChallenge(challenge: "vocabulary" | "collision"): void {
    const msg: AdminUSChallengeStart = {
      admin: true,
      type: "adminStartChallenge",
      auth: this.session.token,
      challenge: challenge,
    };
    this.websocket.send(msg);
  }

  terminate(): void {
    this.termClicks++;

    if (!this.termTimer) {
      this.termTimer = timer(TERMINATION_TIME);
      this.termTimer.subscribe(() => {
        if (this.termClicks > TERMINATION_CLICKS) {
          const msg: AdminUSTerminate = {
            admin: true,
            auth: this.session.token,
            type: "adminTerminate",
          };
          this.websocket.send(msg);
        }
        this.termClicks = 0;
        this.termTimer = undefined;
      });
    }
  }
}
