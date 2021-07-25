import { Component } from '@angular/core';
import { ModalControllerService } from 'src/app/services/modal-controller.service';

@Component({
  selector: 'app-group-result-origin',
  templateUrl: './result-origin.component.html',
  styleUrls: ['./result-origin.component.scss'],
})
export class GroupResultOriginComponent {
  constructor(private modalController: ModalControllerService) {}

  close() {
    this.modalController.dismissTop();
  }
}
