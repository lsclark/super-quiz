import { Subject } from "rxjs";
import { PlayerScore } from "../frontend/src/app/question-types";
import { QuizMessage } from "./messaging";
import Player from "./player";
import QuestionLoader from "./question-loader";
import { TargetManager } from "./target";

export default class QuizHost {
  update$: Subject<boolean>;

  private questionLoader: QuestionLoader;
  private targetManager: TargetManager;
  players: { [key: string]: Player };

  constructor(
    private incoming$: Subject<QuizMessage>,
    private outgoing$: Subject<QuizMessage>
  ) {
    this.update$ = new Subject<boolean>();

    this.questionLoader = new QuestionLoader();
    this.targetManager = new TargetManager();
    this.players = {};

    incoming$.subscribe((message) => this.routeIncoming(message));
  }

  async routeIncoming(message: QuizMessage) {
    console.log(`Incoming: ${JSON.stringify(message)}`);
    if (!(message.name in this.players)) {
      this.newPlayer(message.name);
    }
    let player = this.players[message.name];
    let responses: QuizMessage[] = [];
    switch (message.type) {
      case "connect":
        responses.push({
          name: player.name,
          type: "questions",
          questions: player.getDisplayQuestions(),
        });
        responses.push({
          type: "player_status",
          name: player.name,
          status: player.getPlayerState(),
        });
        responses.push({
          type: "scoreboard",
          name: "_broadcast",
          scores: this.makeScoreboard(),
        });
        player.targets.forEach((target) => {
          responses.push({
            type: "target_assignment",
            name: player.name,
            centre: target.centre,
            others: target.others,
            previous: Array.from(target.submissions),
          });
        });
        break;
      case "submission":
        if (await player.submitAnswer(message.index, message.submission))
          responses.push({
            type: "scoreboard",
            name: "_broadcast",
            scores: this.makeScoreboard(),
          });
        responses.push({
          type: "player_status",
          name: player.name,
          status: player.getPlayerState(),
        });
        break;
      case "target_submit":
        let valid = player.submitTarget(message.letters, message.submission);
        console.log(
          player.name,
          message.submission,
          valid ? "correct" : "incorrect"
        );
        responses.push({
          type: "target_marking",
          name: player.name,
          letters: message.letters,
          submission: message.submission,
          correct: valid,
        });
        if (valid) {
          responses.push({
            type: "scoreboard",
            name: "_broadcast",
            scores: this.makeScoreboard(),
          });
          responses.push({
            type: "player_status",
            name: player.name,
            status: player.getPlayerState(),
          });
        }
        break;

      default:
        break;
    }
    responses.forEach((message) => this.outgoing$.next(message));
  }

  newPlayer(name: string) {
    this.players[name] = new Player(
      name,
      this.questionLoader,
      this.targetManager
    );
  }

  makeScoreboard(): PlayerScore[] {
    return Object.values(this.players).map((plyr) => plyr.makePlayerScore());
  }
}
