import { Component, Input } from '@angular/core';
import { ModalControllerService } from 'src/app/quiz/services/modal-controller.service';

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
    if (!!this.dismiss_cb) this.dismiss_cb();
  }
}
