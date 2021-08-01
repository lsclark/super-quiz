import { Component, Input } from '@angular/core';
import { QuestionDisplay } from 'src/app/message-types';
import { ModalControllerService } from 'src/app/services/modal-controller.service';
import { PlayersService } from 'src/app/services/players.service';

@Component({
  selector: 'app-personal-originator',
  templateUrl: './originator.component.html',
  styleUrls: ['./originator.component.scss'],
})
export class PersonalOriginatorComponent {
  @Input() question!: QuestionDisplay;
  player?: string;

  constructor(
    public modalController: ModalControllerService,
    public playerService: PlayersService
  ) {}

  submit() {
    console.log('SUBMIT PC', this.player);
  }
}
