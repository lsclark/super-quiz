import { Injectable } from '@angular/core';
import { filter } from 'rxjs/operators';
import { NotificationComponent } from '../general/notification/notification.component';
import { DSTimeoutMessage } from '../../models/quiz-message-types';
import { ModalControllerService, ModalSpec } from './modal-controller.service';
import { WebsocketService } from '../../services/websocket.service';

@Injectable({
  providedIn: 'root',
})
export class TimeoutService {
  constructor(
    private websocketService: WebsocketService,
    private modalController: ModalControllerService
  ) {
    this.websocketService.messages$
      ?.pipe(
        filter((msg): msg is DSTimeoutMessage => {
          return msg.type == 'timeout';
        })
      )
      .subscribe(() => {
        let modalSpec: ModalSpec = {
          component: NotificationComponent,
          inputs: {
            title: 'Wake Up',
            body: "It's been a while since you've done anything. Are you still there?",
            button: "I'm here!",
            dismiss_cb: () => this.websocketService.reportAlive(),
          },
        };
        this.modalController.launch(modalSpec);
      });
  }
}
