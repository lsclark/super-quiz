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

    this.incoming$.subscribe((message) => this.routeIncoming(message));
  }

  getPlayer(name: string) {
    if (!(name in this.players)) {
      this.newPlayer(name);
    }
    let player = this.players[name];
    player.accessed();
    return player;
  }

  async routeIncoming(message: QuizMessage) {
    console.log(`Incoming: ${JSON.stringify(message)}`);
    let player = this.getPlayer(message.name);
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
            score: target.getScore(),
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
        let [valid, score] = player.submitTarget(
          message.letters,
          message.submission
        );
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
          score: score,
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
      this.targetManager,
      this
    );
  }

  makeScoreboard(): PlayerScore[] {
    return Object.values(this.players)
      .filter((plyr) => plyr.alive)
      .map((plyr) => plyr.makePlayerScore());
  }

  timeoutWarning(name: string) {
    this.outgoing$.next({
      type: "timeout",
      name: name,
    });
  }
}
