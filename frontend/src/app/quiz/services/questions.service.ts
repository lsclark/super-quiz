import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";
import { filter, map } from "rxjs/operators";

import {
  DisplayAnswer,
  DSPlayerStatusMessage,
  DSQuestionsMessage,
  QuestionDisplay,
  QuestionState,
} from "../../models/quiz-message-types";
import { QuestionColumn } from "../../models/quiz-message-types";
import { WebsocketService } from "../../services/websocket.service";
import { SubmissionComponent } from "../quiz/submission/submission.component";
import { ModalControllerService, ModalSpec } from "./modal-controller.service";
import { SaveResponsesService } from "./save-responses.service";
import { SessionService } from "./session.service";

const getEntries = Object.entries as <T>(
  obj: T
) => Array<[keyof T, T[keyof T]]>;

@Injectable({
  providedIn: "root",
})
export class QuestionsService {
  states$ = new Subject<[number, QuestionState]>();
  ready$ = new BehaviorSubject<boolean>(false);

  questions: QuestionColumn[] = [];
  answers: DisplayAnswer[] = [];
  states: { [index: number]: QuestionState } = {};
  submitted = new Set<number | string>();

  constructor(
    private websocketService: WebsocketService,
    private saveService: SaveResponsesService,
    private modalController: ModalControllerService,
    private session: SessionService
  ) {
    this.subscribe();
  }

  subscribe(): void {
    if (!this.websocketService.messages$) this.websocketService.connect();
    const base$ = this.websocketService.messages$;
    base$
      ?.pipe(
        filter((msg): msg is DSPlayerStatusMessage => {
          return msg.type == "player_status";
        }),
        map((msg) => msg.status.questions)
      )
      .subscribe((msg) => {
        this.states = msg;
        for (const [index, state] of getEntries(msg)) {
          this.states$.next([index, state]);
          if (!this.submitted.has(index) && state !== QuestionState.UnAnswered)
            this.submitted.add(index);
        }
      });
    base$
      ?.pipe(
        filter((msg): msg is DSQuestionsMessage => {
          return msg.type == "questions";
        }),
        map((msg) => msg.questions)
      )
      .subscribe((cols) => {
        this.questions = cols;

        this.ready$.next(true);
      });

    base$
      ?.pipe(
        filter((msg): msg is DSPlayerStatusMessage => {
          return msg.type == "player_status";
        }),
        map((msg) => msg.status.answers)
      )
      .subscribe((msg) => {
        this.answers = msg;
        this.answers.sort((s1, s2) => s1.index - s2.index);
      });
  }

  launchSubmission(question: QuestionDisplay): void {
    const spec: ModalSpec = {
      component: SubmissionComponent,
      identifier: question.index,
      inputs: { question: question },
    };
    this.modalController.launch(spec);
  }

  submitAnswer(index: number): void {
    const response = this.saveService.get(index);
    if (
      (typeof response == "string" && response.length) ||
      (typeof response == "number" && response >= 0)
    )
      this.websocketService.send({
        name: this.session.username,
        type: "submission",
        index: index,
        submission: response,
      });
  }
}
