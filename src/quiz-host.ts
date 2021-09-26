import { Subject } from "rxjs";

import ChallengeManager from "./challenges/challenge-queuing";
import { GroupChallengeManager } from "./challenges/group-challenge";
import { PersonalChallengeManager } from "./challenges/personal-challenge";
import { QuizMessage } from "./models/game-message-types";
import Player from "./player";
import QuestionLoader from "./question/question-loader";
import { Scorer } from "./scoring";
import { TargetManager } from "./target";

export default class QuizHost {
  private active = false;
  private pendingMessages: QuizMessage[] = [];
  update$: Subject<boolean>;

  private questionLoader: QuestionLoader = new QuestionLoader();
  private targetManager: TargetManager = new TargetManager();
  groupChallengeManager: GroupChallengeManager;
  personalChallengeManager: PersonalChallengeManager;
  challengeManager: ChallengeManager;
  scorer: Scorer;

  players: { [key: string]: Player } = {};

  constructor(
    private incoming$: Subject<QuizMessage>,
    public outgoing$: Subject<QuizMessage>
  ) {
    this.update$ = new Subject<boolean>();

    this.scorer = new Scorer(this.outgoing$, this);
    this.groupChallengeManager = new GroupChallengeManager(
      this.outgoing$,
      this
    );
    this.personalChallengeManager = new PersonalChallengeManager(
      this.outgoing$,
      this
    );
    this.challengeManager = new ChallengeManager(
      this,
      this.outgoing$,
      this.targetManager,
      this.personalChallengeManager,
      this.groupChallengeManager
    );

    this.incoming$.subscribe((message) => {
      this.active
        ? this.routeIncoming(message)
        : this.pendingMessages.push(message);
    });
  }

  startQuiz(): void {
    this.active = true;
    this.pendingMessages.forEach((msg) => this.routeIncoming(msg));
    this.pendingMessages = [];
  }

  stopQuiz(): void {
    this.active = false;
  }

  getPlayer(name: string): Player | undefined {
    if (!(name in this.players)) {
      this.newPlayer(name);
    }
    const player = this.players[name];
    if (player) player.accessed();
    return player;
  }

  async routeIncoming(message: QuizMessage): Promise<void> {
    console.log(`Incoming: ${JSON.stringify(message)}`);
    const player = this.getPlayer(message.name);
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
        {
          const delegate = this.getPlayer(message.delegate);
          if (!delegate) return;
          this.challengeManager.createPersonal(
            player,
            delegate,
            player.getQuestion(message.index)
          );
        }
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
        this.challengeManager.createGroup(
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

      case "vocabulary_challenge_submit":
        this.challengeManager.vocabSubmit(message.name, message.submission);
        break;

      case "collision_challenge_submit":
        this.challengeManager.collisionSubmit(message.name, message.submission);
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

  handleConnect(player: Player): void {
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
  ): Promise<void> {
    if (await player.submitAnswer(index, submission, false))
      this.scorer.distributeScores();
    this.sendPlayerState(player);
  }

  handleTargetSubmit(
    player: Player,
    letters: string,
    submission: string
  ): void {
    const [valid, score] = player.submitTarget(letters, submission);
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

  sendPlayerState(player: Player): void {
    this.outgoing$.next({
      type: "player_status",
      name: player.name,
      status: player.getPlayerState(),
    });
  }

  timeoutWarning(name: string): void {
    this.outgoing$.next({
      type: "timeout",
      name: name,
    });
  }
}
