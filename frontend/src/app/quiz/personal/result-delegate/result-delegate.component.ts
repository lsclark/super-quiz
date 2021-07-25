import { Component } from '@angular/core';
import { ModalControllerService } from 'src/app/services/modal-controller.service';

@Component({
  selector: 'app-personal-result-delegate',
  templateUrl: './result-delegate.component.html',
  styleUrls: ['./result-delegate.component.scss'],
})
export class PersonalResultDelegateComponent {
  constructor(private modalController: ModalControllerService) {}

  close() {
    this.modalController.dismissTop();
  }
}
