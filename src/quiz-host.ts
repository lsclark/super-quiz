import { Subject } from "rxjs";
import { GroupChallengeManager } from "./group-challenge";
import {
  QuizMessage,
  PlayerScore,
  DSScoreboardMessage,
  DSPersonalChallengeOutcome,
} from "./message-types";
import Player from "./player";
import QuestionLoader from "./question-loader";
import { TargetManager } from "./target";

export default class QuizHost {
  update$: Subject<boolean>;

  private questionLoader: QuestionLoader;
  private targetManager: TargetManager;
  private groupChallengeManager: GroupChallengeManager;
  players: { [key: string]: Player };

  constructor(
    private incoming$: Subject<QuizMessage>,
    private outgoing$: Subject<QuizMessage>
  ) {
    this.update$ = new Subject<boolean>();

    this.questionLoader = new QuestionLoader();
    this.targetManager = new TargetManager();
    this.groupChallengeManager = new GroupChallengeManager(
      this.outgoing$,
      this
    );
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
      case "personal-origin":
        player.personalChallengeInit(message.index, message.delegate);
        responses.push({
          type: "player_status",
          name: player.name,
          status: player.getPlayerState(),
        });
        responses.push({
          type: "personal-distribute",
          name: message.delegate,
          origin: message.name,
          question: player.getQuestion(message.index),
        });
        break;
      case "personal-submit":
        let origin = this.getPlayer(message.origin);
        let correct = await origin.submitAnswer(
          message.question.index,
          message.submission
        );
        if (correct) {
          player.addBonus(
            `personal-${message.origin}-${message.question.index}`,
            message.question.points! / 2
          );
          origin.addBonus(
            `personal-${message.origin}-${message.question.index}`,
            message.question.points! / 2
          );
          responses.push({
            type: "scoreboard",
            name: "_broadcast",
            scores: this.makeScoreboard(),
          });
        }
        let outcome_delegate: DSPersonalChallengeOutcome = {
          type: "personal-outcome",
          name: message.name,
          answer: origin.getAnswer(message.question.index),
          delegate: message.name,
          origin: message.origin,
          question: message.question,
          success: correct,
        };
        responses.push(outcome_delegate);
        let outcome_origin = { ...outcome_delegate };
        outcome_origin.name = message.origin;
        responses.push(outcome_origin);
        responses.push({
          type: "player_status",
          name: origin.name,
          status: origin.getPlayerState(),
        });
        break;

      case "group-origin":
        player.groupChallengeInit(message.index, message.wager);
        responses.push({
          type: "player_status",
          name: player.name,
          status: player.getPlayerState(),
        });
        let question = player.getQuestion(message.index);
        responses.push({
          type: "group-distribute",
          name: "_broadcast",
          origin: message.name,
          question: question,
          wager: message.wager,
        });
        let active = Object.entries(this.players)
          .filter(([name, other]) => other.alive && name != player.name)
          .map(([name, other]) => name);
        this.groupChallengeManager.create(
          player,
          message.wager,
          question,
          active
        );
        break;
      case "group-submit":
        this.groupChallengeManager.submit(
          message.origin,
          player,
          message.question,
          message.submission
        );
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

  timedOut(name: string) {
    let bcast: DSScoreboardMessage = {
      type: "scoreboard",
      name: "_broadcast",
      scores: this.makeScoreboard(),
    };
    this.outgoing$.next(bcast);
  }
}
