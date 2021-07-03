import { Subject } from "rxjs";
import { PlayerScore } from "../frontend/src/app/question-types";
import { QuizMessage } from "./messaging";
import Player from "./player";
import QuestionLoader from "./question-loader";

export default class QuizHost {
  update$: Subject<boolean>;

  private questionLoader: QuestionLoader;
  players: { [key: string]: Player };

  constructor(
    private incoming$: Subject<QuizMessage>,
    private outgoing$: Subject<QuizMessage>
  ) {
    this.update$ = new Subject<boolean>();

    this.questionLoader = new QuestionLoader();
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

      default:
        break;
    }
    responses.forEach((message) => this.outgoing$.next(message));
  }

  newPlayer(name: string) {
    this.players[name] = new Player(name, this.questionLoader);
  }

  makeScoreboard(): PlayerScore[] {
    return Object.values(this.players).map((plyr) => plyr.makePlayerScore());
  }
}
