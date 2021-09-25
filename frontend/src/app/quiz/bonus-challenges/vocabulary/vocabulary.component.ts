import { Component } from "@angular/core";
import { USVocabularyChallengeSubmit } from "src/app/models/quiz-message-types";
import { WebsocketService } from "src/app/services/websocket.service";
import { ModalControllerService } from "../../services/modal-controller.service";
import { SessionService } from "../../services/session.service";

@Component({
  selector: "app-vocabulary",
  templateUrl: "./vocabulary.component.html",
  styleUrls: ["./vocabulary.component.scss"],
})
export class VocabularyChallengeComponent {
  response = "";

  constructor(
    private websocket: WebsocketService,
    private session: SessionService,
    private modalController: ModalControllerService
  ) {}

  submit(): void {
    if (this.response == "") return;
    const msg: USVocabularyChallengeSubmit = {
      name: this.session.username,
      type: "vocabulary_challenge_submit",
      submission: this.response,
    };
    this.websocket.send(msg);
    this.modalController.dismissTop();
  }
}
