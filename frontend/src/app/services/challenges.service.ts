import { Injectable } from '@angular/core';
import { filter } from 'rxjs/operators';
import {
  DSGroupChallengeDistribute,
  DSGroupChallengeOutcome,
  DSPersonalChallengeDistribute,
  DSPersonalChallengeOutcome,
  QuestionDisplay,
  USGroupChallengeSubmit,
  USPersonalChallengeSubmit,
} from '../message-types';
import { ModalControllerService } from './modal-controller.service';
import { SessionService } from './session.service';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root',
})
export class ChallengesService {
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
        filter((msg): msg is DSGroupChallengeDistribute => {
          return msg.type == 'group-distribute';
        })
      )
      .subscribe((msg) => {
        // TODO: group challenge receive
      });

    this.websocketService.messages$
      ?.pipe(
        filter((msg): msg is DSGroupChallengeOutcome => {
          return msg.type == 'group-outcome';
        })
      )
      .subscribe((msg) => {
        // TODO: group challenge receive
      });

    this.websocketService.messages$
      ?.pipe(
        filter((msg): msg is DSPersonalChallengeDistribute => {
          return msg.type == 'personal-distribute';
        })
      )
      .subscribe((msg) => {
        // TODO: group challenge receive
      });

    this.websocketService.messages$
      ?.pipe(
        filter((msg): msg is DSPersonalChallengeOutcome => {
          return msg.type == 'personal-outcome';
        })
      )
      .subscribe((msg) => {
        // TODO: group challenge receive
      });
  }

  groupSubmitAnswer(
    origin: string,
    question: QuestionDisplay,
    submission: number | string
  ) {
    let msg: USGroupChallengeSubmit = {
      name: this.session.username,
      type: 'group-submit',
      origin: origin,
      question: question,
      submission: submission,
    };
    this.websocketService.send(msg);
  }

  personalSubmitAnswer(
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
}
