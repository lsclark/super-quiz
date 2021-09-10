import { Component } from '@angular/core';
import {
  AdminUSChallengeStart,
  AdminUSGameControl,
} from 'src/app/models/admin-message-types';
import { WebsocketService } from 'src/app/services/websocket.service';
import { AdminGameStateService } from '../services/admin-game-state.service';
import { AdminSessionService } from '../services/admin-session.service';

@Component({
  selector: 'app-admin-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent {
  constructor(
    public gameStateService: AdminGameStateService,
    private session: AdminSessionService,
    private websocket: WebsocketService
  ) {}

  gameState(state: 'start' | 'stop') {
    let msg: AdminUSGameControl = {
      admin: true,
      type: 'adminGameControl',
      auth: this.session.token,
      state: state,
    };
    this.websocket.send(msg);
  }

  startChallenge(challenge: 'vocabulary' | 'collision') {
    let msg: AdminUSChallengeStart = {
      admin: true,
      type: 'adminStartChallenge',
      auth: this.session.token,
      challenge: challenge,
    };
    this.websocket.send(msg);
  }
}
