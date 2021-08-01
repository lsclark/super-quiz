import { Injectable } from '@angular/core';
import { filter } from 'rxjs/operators';
import { DSTimeoutMessage } from '../message-types';
import { ModalControllerService } from './modal-controller.service';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root',
})
export class HeartbeatService {
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
        this.modalController.launchTimeoutWarning();
      });
  }
}
