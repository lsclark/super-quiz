import { Component } from '@angular/core';
import { ModalControllerService } from 'src/app/services/modal-controller.service';

@Component({
  selector: 'app-group-result-winner',
  templateUrl: './result-winner.component.html',
  styleUrls: ['./result-winner.component.scss'],
})
export class GroupResultWinnerComponent {
  constructor(private modalController: ModalControllerService) {}

  close() {
    this.modalController.dismissTop();
  }
}
