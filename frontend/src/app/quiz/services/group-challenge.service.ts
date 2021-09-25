import { Injectable } from "@angular/core";
import { filter } from "rxjs/operators";

import {
  DSGroupChallengeDistribute,
  DSGroupChallengeOutcome,
  QuestionDisplay,
  USGroupChallengeOrigin,
  USGroupChallengeSubmit,
} from "../../models/quiz-message-types";
import { WebsocketService } from "../../services/websocket.service";
import { NotificationComponent } from "../general/notification/notification.component";
import { GroupChallengedComponent } from "../quiz/group/challenged/challenged.component";
import { GroupOriginatorComponent } from "../quiz/group/originator/originator.component";
import { ModalControllerService, ModalSpec } from "./modal-controller.service";
import { SessionService } from "./session.service";

@Injectable({
  providedIn: "root",
})
export class GroupChallengeService {
  constructor(
    private websocketService: WebsocketService,
    private modalController: ModalControllerService,
    private session: SessionService
  ) {
    this.subscribe();
  }

  subscribe(): void {
    if (!this.websocketService.messages$) this.websocketService.connect();

    this.websocketService.messages$
      ?.pipe(
        filter((msg): msg is DSGroupChallengeDistribute => {
          return (
            msg.type == "group-distribute" &&
            msg.origin != this.session.username
          );
        })
      )
      .subscribe((msg) => {
        const spec: ModalSpec = {
          component: GroupChallengedComponent,
          identifier: `${msg.origin}-${msg.question.index}`,
          inputs: {
            question: msg.question,
            player: msg.origin,
            wager: msg.wager,
          },
        };
        this.modalController.launch(spec);
      });

    this.websocketService.messages$
      ?.pipe(
        filter((msg): msg is DSGroupChallengeOutcome => {
          return msg.type == "group-outcome";
        })
      )
      .subscribe((msg) => {
        if (this.session.username == msg.origin && !!msg.victor) {
          const spec = {
            component: NotificationComponent,
            inputs: {
              title: msg.victor == msg.origin ? "Success" : "Unlucky",
              body:
                msg.victor == msg.origin
                  ? `You were right: nobody responded correctly. Those ${msg.wager} points are now yours.`
                  : `Nope. ${msg.victor} knew the answer. You've lost ${msg.wager} points.`,
              button: "OK",
            },
          };
          this.modalController.launch(spec);
        } else if (this.session.username == msg.victor) {
          const spec = {
            component: NotificationComponent,
            inputs: {
              title: "Winner",
              body: `${msg.origin} was wrong. You knew after all. Those ${msg.wager} points are now yours.`,
              button: "Let's move on",
            },
          };
          this.modalController.launch(spec);
        } else {
          this.modalController.purgeIdentifier(
            `${msg.origin}-${msg.question.index}`
          );
        }
      });
  }

  sendChallenge(question: QuestionDisplay, wager: number): void {
    const msg: USGroupChallengeOrigin = {
      name: this.session.username,
      type: "group-origin",
      index: question.index,
      wager: wager,
    };
    this.websocketService.send(msg);
  }

  submitAnswer(
    origin: string,
    question: QuestionDisplay,
    submission: number | string
  ): void {
    const msg: USGroupChallengeSubmit = {
      name: this.session.username,
      type: "group-submit",
      origin: origin,
      question: question,
      submission: submission,
    };
    this.websocketService.send(msg);
  }

  initiate(question: QuestionDisplay): void {
    const spec: ModalSpec = {
      component: GroupOriginatorComponent,
      identifier: question.index,
      inputs: { question: question },
    };
    this.modalController.launch(spec);
  }
}
