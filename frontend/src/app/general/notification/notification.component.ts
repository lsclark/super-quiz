import { Component, Input } from '@angular/core';
import { ModalControllerService } from 'src/app/services/modal-controller.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent {
  @Input() title!: string;
  @Input() body!: string;
  @Input() button!: string;
  @Input() dismiss_cb!: () => void;

  constructor(private modalController: ModalControllerService) {}

  dismiss() {
    this.modalController.dismissTop();
    this.dismiss_cb();
  }
}
