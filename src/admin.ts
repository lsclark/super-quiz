import { merge, Subject, timer } from "rxjs";
import { debounceTime, filter } from "rxjs/operators";

import {
  AdminDSPlayerState,
  AdminMessage,
  AdminUSAwardBonus,
  AdminUSChallengeStart,
  AdminUSGameControl,
  AdminUSQuestionOverride,
} from "./models/admin-message-types";
import { QuizMessage } from "./models/game-message-types";
import QuizHost from "./quiz-host";

const PERIOD = 15 * 1000;
const DEBOUNCE = 0.5 * 1000;
const AUTH_TOKEN = "i-am-leon";

export class Administrator {
  constructor(
    private quizHost: QuizHost,
    private incoming: Subject<AdminMessage>,
    private outgoing: Subject<AdminMessage>,
    quizOutgoing$: Subject<QuizMessage>
  ) {
    merge(quizOutgoing$, timer(PERIOD, PERIOD))
      .pipe(debounceTime(DEBOUNCE))
      .subscribe(() => {
        this.stateUpdate();
      });

    this.incoming
      .pipe(
        filter(
          (msg): msg is AdminUSQuestionOverride =>
            msg.type == "adminQuestionOverride"
        )
      )
      .subscribe((msg) => this.questionStateOverride(msg));

    this.incoming
      .pipe(
        filter((msg): msg is AdminUSAwardBonus => msg.type == "adminAwardBonus")
      )
      .subscribe((msg) => this.awardBonus(msg));

    this.incoming
      .pipe(
        filter(
          (msg): msg is AdminUSGameControl => msg.type == "adminGameControl"
        )
      )
      .subscribe((msg) => {
        if (msg.state == "start") this.quizHost.startQuiz();
        else if (msg.state == "stop") this.quizHost.stopQuiz();
      });

    this.incoming
      .pipe(
        filter(
          (msg): msg is AdminUSChallengeStart =>
            msg.type == "adminStartChallenge"
        )
      )
      .subscribe((msg) => {
        switch (msg.challenge) {
          case "collision":
            this.quizHost.startCollisionChallenge();
            break;
          case "vocabulary":
            this.quizHost.startVocabChallenge();
            break;
          default:
            break;
        }
      });
  }

  authorise(token: string): boolean {
    console.log("ADMIN AUTH:", token);
    return token == AUTH_TOKEN;
  }

  questionStateOverride(message: AdminUSQuestionOverride): void {
    const player = this.quizHost.getPlayer(message.name);
    this.quizHost.personalChallengeManager.cancel(message.name, message.index);
    this.quizHost.groupChallengeManager.cancel(message.name, message.index);
    if (!player) return;
    player.setQuestionState(message.index, message.state);
    this.quizHost.sendPlayerState(player);
  }

  awardBonus(message: AdminUSAwardBonus): void {
    this.quizHost.scorer.addManual(
      message.name,
      message.description,
      message.score
    );
    const player = this.quizHost.getPlayer(message.name);
    if (player) this.quizHost.sendPlayerState(player);
    this.quizHost.scorer.distributeScores();
  }

  stateUpdate(): void {
    const msg: AdminDSPlayerState = {
      type: "adminState",
      admin: true,
      statuses: Object.values(this.quizHost.players).map((player) =>
        player.adminState()
      ),
    };
    this.outgoing.next(msg);
  }
}
