import { Component, Input, OnInit } from '@angular/core';
import { USCollisionChallengeSubmit } from 'src/app/models/quiz-message-types';
import { WebsocketService } from 'src/app/services/websocket.service';
import { ModalControllerService } from '../../services/modal-controller.service';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-collision',
  templateUrl: './collision.component.html',
  styleUrls: ['./collision.component.scss'],
})
export class CollisionChallengeComponent implements OnInit {
  @Input() players!: number;
  choices: number[] = [];
  private request: number = 0;

  constructor(
    private websocket: WebsocketService,
    private session: SessionService,
    private modalController: ModalControllerService
  ) {}

  ngOnInit(): void {
    this.choices = [...Array(this.players).keys()].map((num) => num + 1);
  }

  selectChoice(request: number) {
    this.request = request;
  }

  submit() {
    if (this.request == 0) return;
    let msg: USCollisionChallengeSubmit = {
      name: this.session.username,
      type: 'collision_challenge_submit',
      submission: this.request,
    };
    this.websocket.send(msg);
    this.modalController.dismissTop();
  }
}
