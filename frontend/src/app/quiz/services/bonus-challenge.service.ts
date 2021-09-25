import { Injectable } from "@angular/core";
import { filter } from "rxjs/operators";
import {
  DSCollisionChallengeOutcome,
  DSCollisionChallengeStart,
  DSVocabularyChallengeOutcome,
  DSVocabularyChallengeStart,
} from "src/app/models/quiz-message-types";
import { WebsocketService } from "src/app/services/websocket.service";

import { CollisionChallengeComponent } from "../bonus-challenges/collision/collision.component";
import { CollisionChallengeOutcomeComponent } from "../bonus-challenges/collision-outcome/collision-outcome.component";
import { VocabularyChallengeComponent } from "../bonus-challenges/vocabulary/vocabulary.component";
import { VocabularyChallengeOutcomeComponent } from "../bonus-challenges/vocabulary-outcome/vocabulary-outcome.component";
import { ModalControllerService, ModalSpec } from "./modal-controller.service";

@Injectable({
  providedIn: "root",
})
export class BonusChallengeService {
  constructor(
    private websocketService: WebsocketService,
    private modalController: ModalControllerService
  ) {
    this.subscribe();
  }

  subscribe(): void {
    if (!this.websocketService.messages$) this.websocketService.connect();

    this.websocketService.messages$
      ?.pipe(
        filter(
          (msg): msg is DSCollisionChallengeStart =>
            msg.type == "collision_challenge_start"
        )
      )
      .subscribe((msg) => {
        this.initiateCollision(msg.players);
      });
    this.websocketService.messages$
      ?.pipe(
        filter(
          (msg): msg is DSVocabularyChallengeStart =>
            msg.type == "vocabulary_challenge_start"
        )
      )
      .subscribe(() => {
        this.initiateVocabulary();
      });

    this.websocketService.messages$
      ?.pipe(
        filter((msg): msg is DSCollisionChallengeOutcome => {
          return msg.type == "collision_challenge_outcome";
        })
      )
      .subscribe((msg) => {
        this.outcomeCollision(msg);
      });

    this.websocketService.messages$
      ?.pipe(
        filter((msg): msg is DSVocabularyChallengeOutcome => {
          return msg.type == "vocabulary_challenge_outcome";
        })
      )
      .subscribe((msg) => {
        this.outcomeVocabulary(msg);
      });
  }

  initiateVocabulary(): void {
    const spec: ModalSpec = {
      component: VocabularyChallengeComponent,
      identifier: "vocabulary-challenge",
      inputs: {},
    };
    this.modalController.launch(spec);
  }

  initiateCollision(playerCount: number): void {
    const spec: ModalSpec = {
      component: CollisionChallengeComponent,
      identifier: "collision-challenge",
      inputs: { players: playerCount },
    };
    this.modalController.launch(spec);
  }

  outcomeVocabulary(msg: DSVocabularyChallengeOutcome): void {
    const spec: ModalSpec = {
      component: VocabularyChallengeOutcomeComponent,
      identifier: "vocabulary-challenge",
      inputs: {
        winners: msg.winners,
        points: msg.points,
        submissions: msg.submissions,
      },
    };
    this.modalController.purgeIdentifier("vocabulary-challenge");
    this.modalController.launch(spec);
  }

  outcomeCollision(msg: DSCollisionChallengeOutcome): void {
    const spec: ModalSpec = {
      component: CollisionChallengeOutcomeComponent,
      identifier: "collision-challenge",
      inputs: {
        winner: msg.winner,
        points: msg.points,
        submissions: msg.submissions,
      },
    };
    this.modalController.purgeIdentifier("collision-challenge");
    this.modalController.launch(spec);
  }
}
