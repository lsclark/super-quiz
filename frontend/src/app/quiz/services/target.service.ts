import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { filter, map } from "rxjs/operators";

import {
  DSTargetAssignment,
  DSTargetMarking,
  USTargetSubmitMessage,
} from "../../models/quiz-message-types";
import { WebsocketService } from "../../services/websocket.service";
import { TargetLetters, TargetResult } from "../target/message-types";
import { SessionService } from "./session.service";

const EXPECTED = 3;

@Injectable({
  providedIn: "root",
})
export class TargetService {
  assignments: { [key: string]: TargetLetters };
  private scores: { [key: string]: number } = {};
  results$?: Observable<TargetResult>;
  ready$ = new BehaviorSubject<boolean>(false);

  constructor(
    private websocketService: WebsocketService,
    private session: SessionService
  ) {
    this.assignments = {};
    this.subscribe();
  }

  subscribe(): void {
    if (!this.websocketService.messages$) this.websocketService.connect();
    const base$ = this.websocketService.messages$;

    this.results$ = base$?.pipe(
      filter((msg): msg is DSTargetMarking => {
        return msg.type == "target_marking";
      }),
      map((msg) => {
        const match = Object.entries(this.scores).find(([letters]) => {
          this.equivalent(letters, msg.letters);
        });
        this.scores[match ? match[0] : msg.letters] = msg.score;
        return {
          letters: msg.letters,
          submission: msg.submission,
          correct: msg.correct,
          score: msg.score,
          maximum:
            msg.score == Math.max(...Object.values(this.scores)) &&
            msg.score > 0,
        };
      })
    );

    base$
      ?.pipe(
        filter((msg): msg is DSTargetAssignment => {
          return msg.type == "target_assignment";
        })
      )
      .subscribe((msg) => {
        const sorted = [msg.centre, ...msg.others].sort().join("");
        if (!(sorted in this.assignments))
          this.assignments[sorted] = {
            centre: msg.centre,
            others: msg.others,
            previous: msg.previous,
            initScore: msg.score,
          };
        if (Object.keys(this.assignments).length >= EXPECTED) {
          this.ready$.next(true);
        }
      });
  }

  submit(letters: string, submission: string): void {
    const data: USTargetSubmitMessage = {
      name: this.session.username,
      type: "target_submit",
      letters: letters,
      submission: submission,
    };
    this.websocketService.send(data);
  }

  equivalent(word1: string, word2: string): boolean {
    return word1.split("").sort().join() === word2.split("").sort().join();
  }
}
