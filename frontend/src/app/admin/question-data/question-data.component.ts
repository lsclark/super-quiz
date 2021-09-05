import { Component, Input } from '@angular/core';
import {
  AdminQuestionState,
  AdminUSQuestionOverride,
  QuestionState,
} from 'src/app/models/admin-message-types';
import { WebsocketService } from 'src/app/services/websocket.service';
import { AdminSessionService } from '../services/admin-session.service';

@Component({
  selector: 'app-admin-question-data',
  templateUrl: './question-data.component.html',
  styleUrls: ['./question-data.component.scss'],
})
export class AdminQuestionDataComponent {
  @Input() index!: number;
  @Input() player!: string;
  @Input() state!: AdminQuestionState;
  QuestionState = QuestionState;

  constructor(
    private websocket: WebsocketService,
    private session: AdminSessionService
  ) {}

  private sendState(state: QuestionState) {
    let msg: AdminUSQuestionOverride = {
      admin: true,
      type: 'adminQuestionOverride',
      auth: this.session.token,
      index: this.index,
      name: this.player,
      state: state,
    };
    this.websocket.send(msg);
  }

  markCorrect() {
    this.sendState(QuestionState.Correct);
  }

  markIncorrect() {
    this.sendState(QuestionState.Incorrect);
  }

  markReset() {
    this.sendState(QuestionState.UnAnswered);
  }
}
