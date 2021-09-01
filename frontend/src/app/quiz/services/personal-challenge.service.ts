import { Injectable } from '@angular/core';
import { filter } from 'rxjs/operators';
import { NotificationComponent } from '../general/notification/notification.component';
import {
  DSPersonalChallengeDistribute,
  DSPersonalChallengeOutcome,
  DSPersonalChallengeTimeout,
  QuestionDisplay,
  USPersonalChallengeOrigin,
  USPersonalChallengeSubmit,
} from '../../models/quiz-message-types';
import { PersonalDelegatedComponent } from '../quiz/personal/delegated/delegated.component';
import { PersonalOriginatorComponent } from '../quiz/personal/originator/originator.component';
import { ModalControllerService, ModalSpec } from './modal-controller.service';
import { SessionService } from './session.service';
import { WebsocketService } from '../../services/websocket.service';

@Injectable({
  providedIn: 'root',
})
export class PersonalChallengeService {
  constructor(
    private websocketService: WebsocketService,
    private modalController: ModalControllerService,
    private session: SessionService
  ) {
    this.subscribe();
  }

  subscribe() {
    if (!this.websocketService.messages$) this.websocketService.connect();

    this.websocketService.messages$
      ?.pipe(
        filter((msg): msg is DSPersonalChallengeDistribute => {
          return msg.type == 'personal-distribute';
        })
      )
      .subscribe((msg) => {
        let spec: ModalSpec = {
          component: PersonalDelegatedComponent,
          identifier: `${msg.origin}-${msg.question.index}`,
          inputs: { question: msg.question, player: msg.origin },
        };
        this.modalController.launch(spec);
      });

    this.websocketService.messages$
      ?.pipe(
        filter((msg): msg is DSPersonalChallengeOutcome => {
          return msg.type == 'personal-outcome';
        })
      )
      .subscribe((msg) => {
        if (this.session.username == msg.origin) {
          let spec: ModalSpec = {
            component: NotificationComponent,
            identifier: `${msg.origin}-${msg.question.index}`,
            inputs: {
              title: msg.success ? 'Success' : 'Unlucky',
              body: msg.success
                ? `${msg.delegate} got it right. Those ${
                    msg.question.points! / 2
                  } points are now yours.`
                : `${msg.delegate} wasn't any help.`,
              button: 'OK',
            },
          };
          this.modalController.launch(spec);
        } else if (this.session.username == msg.delegate) {
          let spec: ModalSpec = {
            component: NotificationComponent,
            identifier: `${msg.origin}-${msg.question.index}`,
            inputs: {
              title: msg.success ? 'Success' : 'Unlucky',
              body: msg.success
                ? `That's right. Those ${
                    msg.question.points! / 2
                  } points are now yours.`
                : `That's not right. The answer was ${msg.answer}.`,
              button: "Let's move on",
            },
          };
          this.modalController.launch(spec);
        }
      });

    this.websocketService.messages$
      ?.pipe(
        filter((msg): msg is DSPersonalChallengeTimeout => {
          return msg.type == 'personal-timeout';
        })
      )
      .subscribe((msg) => {
        let identifier = `${msg.origin}-${msg.question.index}`;
        this.modalController.purgeIdentifier(identifier);
        let spec: ModalSpec = {
          component: NotificationComponent,
          identifier: identifier,
          inputs: {
            title: this.session.username == msg.origin ? 'Refund' : 'Too Slow',
            body:
              this.session.username == msg.origin
                ? `${
                    msg.delegate
                  } took too long. You can try to answer question ${
                    msg.question.index + 1
                  } again.`
                : `You took too long to answer ${msg.origin}'s question.`,
            button: "Let's move on",
          },
        };
        this.modalController.launch(spec);
      });
  }

  sendChallenge(question: QuestionDisplay, delegate: string) {
    let msg: USPersonalChallengeOrigin = {
      name: this.session.username,
      type: 'personal-origin',
      index: question.index,
      delegate: delegate,
    };
    this.websocketService.send(msg);
  }

  submitAnswer(
    origin: string,
    question: QuestionDisplay,
    submission: number | string
  ) {
    let msg: USPersonalChallengeSubmit = {
      name: this.session.username,
      type: 'personal-submit',
      origin: origin,
      question: question,
      submission: submission,
    };
    this.websocketService.send(msg);
  }

  initiate(question: QuestionDisplay) {
    let spec: ModalSpec = {
      component: PersonalOriginatorComponent,
      identifier: question.index,
      inputs: { question: question },
    };
    this.modalController.launch(spec);
  }
}
