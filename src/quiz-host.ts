import { Subject } from "rxjs";
import { GroupChallengeManager } from "./group-challenge";
import { QuizMessage } from "./message-types";
import { PersonalChallengeManager } from "./personal-challenge";
import Player from "./player";
import QuestionLoader from "./question-loader";
import { Scorer } from "./scoring";
import { TargetManager } from "./target";

export default class QuizHost {
  update$: Subject<boolean>;

  private questionLoader: QuestionLoader;
  private targetManager: TargetManager;
  groupChallengeManager: GroupChallengeManager;
  personalChallengeManager: PersonalChallengeManager;
  scorer: Scorer;

  players: { [key: string]: Player } = {};

  constructor(
    private incoming$: Subject<QuizMessage>,
    private outgoing$: Subject<QuizMessage>
  ) {
    this.update$ = new Subject<boolean>();

    this.questionLoader = new QuestionLoader();
    this.targetManager = new TargetManager();
    this.scorer = new Scorer(this.outgoing$, this);
    this.groupChallengeManager = new GroupChallengeManager(
      this.outgoing$,
      this
    );
    this.personalChallengeManager = new PersonalChallengeManager(
      this.outgoing$,
      this
    );

    this.incoming$.subscribe((message) => this.routeIncoming(message));
  }

  getPlayer(name: string): Player | undefined {
    if (!(name in this.players)) {
      this.newPlayer(name);
    }
    let player = this.players[name];
    if (player) player.accessed();
    return player;
  }

  async routeIncoming(message: QuizMessage) {
    console.log(`Incoming: ${JSON.stringify(message)}`);
    let player = this.getPlayer(message.name);
    if (!player) return;
    switch (message.type) {
      case "connect":
        this.handleConnect(player);
        break;

      case "submission":
        this.handleQuestionSubmit(player, message.index, message.submission);
        break;

      case "target_submit":
        this.handleTargetSubmit(player, message.letters, message.submission);
        break;

      case "personal-origin":
        let delegate = this.getPlayer(message.delegate);
        if (!delegate) return;
        this.personalChallengeManager.create(
          player,
          player.getQuestion(message.index),
          delegate
        );
        break;

      case "personal-submit":
        this.personalChallengeManager.submit(
          message.origin,
          message.name,
          message.question,
          message.submission
        );
        break;

      case "group-origin":
        this.groupChallengeManager.create(
          player,
          message.wager,
          player.getQuestion(message.index)
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
  }

  private newPlayer(name: string) {
    this.players[name] = new Player(
      name,
      this.questionLoader,
      this.targetManager,
      this
    );
  }

  handleConnect(player: Player) {
    this.outgoing$.next({
      name: player.name,
      type: "questions",
      questions: player.getDisplayQuestions(),
    });
    this.outgoing$.next({
      type: "player_status",
      name: player.name,
      status: player.getPlayerState(),
    });
    this.scorer.distributeScores();
    player.targets.forEach((target) => {
      this.outgoing$.next({
        type: "target_assignment",
        name: player.name,
        centre: target.centre,
        others: target.others,
        previous: Array.from(target.submissions),
        score: target.getScore(),
      });
    });
  }

  async handleQuestionSubmit(
    player: Player,
    index: number,
    submission: number | string
  ) {
    if (await player.submitAnswer(index, submission, false))
      this.scorer.distributeScores();
    this.sendPlayerState(player);
  }

  handleTargetSubmit(player: Player, letters: string, submission: string) {
    let [valid, score] = player.submitTarget(letters, submission);
    console.log(player.name, submission, valid ? "correct" : "incorrect");
    this.outgoing$.next({
      type: "target_marking",
      name: player.name,
      letters: letters,
      submission: submission,
      correct: valid,
      score: score,
    });
    if (valid) {
      this.sendPlayerState(player);
      this.scorer.distributeScores();
    }
  }

  sendPlayerState(player: Player) {
    this.outgoing$.next({
      type: "player_status",
      name: player.name,
      status: player.getPlayerState(),
    });
  }

  timeoutWarning(name: string) {
    this.outgoing$.next({
      type: "timeout",
      name: name,
    });
  }

  timedOut(name: string) {
    this.scorer.distributeScores();
  }
}
