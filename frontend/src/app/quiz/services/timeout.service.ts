import { Injectable } from '@angular/core';
import { filter } from 'rxjs/operators';

import { DSTimeoutMessage } from '../../models/quiz-message-types';
import { WebsocketService } from '../../services/websocket.service';
import { NotificationComponent } from '../general/notification/notification.component';
import { ModalControllerService, ModalSpec } from './modal-controller.service';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class TimeoutService {
  constructor(
    private websocketService: WebsocketService,
    private session: SessionService,
    private modalController: ModalControllerService
  ) {
    this.websocketService.messages$
      ?.pipe(
        filter((msg): msg is DSTimeoutMessage => {
          return msg.type == 'timeout';
        })
      )
      .subscribe(() => {
        const modalSpec: ModalSpec = {
          component: NotificationComponent,
          inputs: {
            title: 'Wake Up',
            body: "It's been a while since you've done anything. Are you still there?",
            button: "I'm here!",
            dismiss_cb: () => this.session.reportAlive(),
          },
        };
        this.modalController.launch(modalSpec);
      });
  }
}
