import { Component, Input, OnChanges } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import {
  AdminPlayer,
  AdminQuestionState,
  AdminUSAwardBonus,
  ScoreItem,
} from "src/app/models/admin-message-types";
import { WebsocketService } from "src/app/services/websocket.service";

import { AdminGameStateService } from "../services/admin-game-state.service";
import { AdminSessionService } from "../services/admin-session.service";

@Component({
  selector: "app-admin-player-state",
  templateUrl: "./player-state.component.html",
  styleUrls: ["./player-state.component.scss"],
})
export class AdminPlayerStateComponent implements OnChanges {
  @Input() player!: string;
  questions: [number, AdminQuestionState][] = [];
  scores: ScoreItem[] = [];
  selected = 0;

  bonusForm = this.formBuilder.group({
    description: "",
    score: 0,
  });

  constructor(
    private stateService: AdminGameStateService,
    private websocket: WebsocketService,
    private session: AdminSessionService,
    private formBuilder: FormBuilder
  ) {}

  ngOnChanges(): void {
    this.stateService
      .getPlayerState(this.player)
      ?.subscribe((status) => this.parseState(status));
  }

  parseState(state: AdminPlayer): void {
    this.questions = Object.entries(state.questions)
      .map(([index, questState]): [number, AdminQuestionState] => [
        Number.parseInt(index),
        questState,
      ])
      .sort(([idxa], [idxb]) => idxa - idxb);
    this.scores = state.scores;
  }

  submitBonus(): void {
    if (!this.bonusForm.value.description) return;
    const msg: AdminUSAwardBonus = {
      admin: true,
      auth: this.session.token,
      type: "adminAwardBonus",
      name: this.player,
      description: this.bonusForm.value.description,
      score: this.bonusForm.value.score,
    };
    this.websocket.send(msg);
  }
}
