import { merge, Subject, timer } from "rxjs";
import { debounceTime, filter } from "rxjs/operators";
import {
  AdminDSPlayerState,
  AdminMessage,
  AdminUSAwardBonus,
  AdminUSQuestionOverride,
} from "./admin-message-types";
import { QuizMessage } from "./message-types";
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
  }

  authorise(token: string): boolean {
    console.log("ADMIN AUTH:", token);
    return token == AUTH_TOKEN;
  }

  questionStateOverride(message: AdminUSQuestionOverride): void {
    let player = this.quizHost.getPlayer(message.name);
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
    let player = this.quizHost.getPlayer(message.name);
    if (player) this.quizHost.sendPlayerState(player);
    this.quizHost.scorer.distributeScores();
  }

  stateUpdate(): void {
    let msg: AdminDSPlayerState = {
      type: "adminState",
      admin: true,
      statuses: Object.values(this.quizHost.players).map((player) =>
        player.adminState()
      ),
    };
    this.outgoing.next(msg);
  }
}
