import { Subject, timer } from "rxjs";
import { filter } from "rxjs/operators";
import {
  AdminDSPlayerState,
  AdminMessage,
  AdminUSQuestionOverride,
} from "./admin-message-types";
import QuizHost from "./quiz-host";

const PERIOD = 15 * 1000;
const AUTH_TOKEN = "i-am-leon";

export class Administrator {
  constructor(
    private quizHost: QuizHost,
    private incoming: Subject<AdminMessage>,
    private outgoing: Subject<AdminMessage>
  ) {
    timer(PERIOD, PERIOD).subscribe(() => {
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
  }

  authorise(token: string): boolean {
    console.log("ADMIN AUTH:", token);
    return token == AUTH_TOKEN;
  }

  questionStateOverride(message: AdminUSQuestionOverride): void {
    let player = this.quizHost.getPlayer(message.name);
    player.setQuestionState(message.index, message.state);
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
