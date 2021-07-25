import { Component } from '@angular/core';
import { ModalControllerService } from 'src/app/services/modal-controller.service';
import { WebsocketService } from 'src/app/services/websocket.service';

@Component({
  selector: 'app-timeout-warning',
  templateUrl: './timeout-warning.component.html',
  styleUrls: ['./timeout-warning.component.scss'],
})
export class TimeoutWarningComponent {
  constructor(
    private websocketService: WebsocketService,
    private modalController: ModalControllerService
  ) {}

  submit() {
    this.websocketService.reportAlive();
    this.modalController.dismissTop();
  }
}
