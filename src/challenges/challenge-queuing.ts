import { Observable, Subject } from "rxjs";

import { QuestionDisplay, QuizMessage } from "../models/game-message-types";
import Player from "../player";
import QuizHost from "../quiz-host";
import { TargetManager } from "../target";
import { CollisionChallenge, VocabularyChallenge } from "./bonus-challenges";
import { GroupChallengeManager } from "./group-challenge";
import { PersonalChallengeManager } from "./personal-challenge";

type PersonalSpec = {
  type: "personal";
  origin: Player;
  delegate: Player;
  question: QuestionDisplay;
};
type GroupSpec = {
  type: "group";
  origin: Player;
  wager: number;
  question: QuestionDisplay;
};
type VocabSpec = {
  type: "vocabulary";
};
type CollisionSpec = {
  type: "collision";
};
type ChallengeSpec = PersonalSpec | GroupSpec | VocabSpec | CollisionSpec;

/**
 * Delays the launch of a challenge until the target player has no ongoing
 * challenges.
 */
class QueuedChallenge {
  blockers: QueuedChallenge[];
  launched = false;
  complete = false;
  finished$ = new Subject<void>();

  constructor(
    private spec: ChallengeSpec,
    private manager: ChallengeManager,
    queue: QueuedChallenge[]
  ) {
    // Find items in the queue that block this challenge
    this.blockers = [];
    for (let idx = queue.length - 1; idx >= 0; idx--) {
      const queueItem = queue[idx];
      if (queueItem.complete) continue;
      const queueSpec = queueItem.spec;
      if (this.spec.type == "personal") {
        if (queueSpec.type == "personal") {
          if (queueSpec.delegate.name == this.spec.delegate.name) {
            this.blockers.push(queueItem);
            break;
          }
        } else {
          this.blockers.push(queueItem);
          break;
        }
      } else {
        if (queueSpec.type == "personal") {
          if (
            this.blockers.filter(
              (ch) =>
                (ch.spec as PersonalSpec | undefined)?.delegate.name ===
                queueSpec.delegate.name
            ).length === 0
          ) {
            this.blockers.push(queueItem);
          }
        } else {
          this.blockers.push(queueItem);
          break;
        }
      }
    }
    console.log("BLOKERS", this.blockers);
    if (this.blockers.length == 0) {
      this.testThenLaunch();
    } else {
      this.blockers.forEach((chlng) =>
        chlng.finished$.subscribe(() => this.testThenLaunch())
      );
    }
  }

  testThenLaunch() {
    if (
      this.launched ||
      (this.blockers.length &&
        this.blockers.filter((ch) => !ch.complete).length)
    )
      return;
    this.launched = true;
    const finishObs = this.manager.launch(this.spec);
    const subs = finishObs?.subscribe((finished) => {
      if (finished) {
        subs?.unsubscribe();
        this.complete = true;
        this.finished$.next();
      }
    });
  }
}

export default class ChallengeManager {
  private vocabChallenge?: VocabularyChallenge;
  private collisionChallenge?: CollisionChallenge;
  private queue: QueuedChallenge[] = [];

  constructor(
    private host: QuizHost,
    private outgoing$: Subject<QuizMessage>,
    private targetManager: TargetManager,
    private personal: PersonalChallengeManager,
    private group: GroupChallengeManager
  ) {}

  createPersonal(
    origin: Player,
    delegate: Player,
    question: QuestionDisplay
  ): void {
    const spec: PersonalSpec = {
      type: "personal",
      origin: origin,
      delegate: delegate,
      question: question,
    };
    this.create(spec);
  }

  createGroup(origin: Player, wager: number, question: QuestionDisplay): void {
    const spec: GroupSpec = {
      type: "group",
      origin: origin,
      wager: wager,
      question: question,
    };
    this.create(spec);
  }

  createVocab(): void {
    const spec: VocabSpec = {
      type: "vocabulary",
    };
    this.create(spec);
  }

  createCollision(): void {
    const spec: CollisionSpec = {
      type: "collision",
    };
    this.create(spec);
  }

  create(spec: ChallengeSpec): void {
    const challenge = new QueuedChallenge(spec, this, this.queue);
    this.queue.push(challenge);
  }

  vocabSubmit(name: string, submission: string): void {
    this.vocabChallenge?.submit(name, submission);
  }

  collisionSubmit(name: string, submission: number): void {
    this.collisionChallenge?.submit(name, submission);
  }

  launch(spec: ChallengeSpec): Observable<boolean> | void {
    switch (spec.type) {
      case "personal":
        return this.personal.create(spec.origin, spec.question, spec.delegate);
      case "group":
        return this.group.create(spec.origin, spec.wager, spec.question);
      case "collision":
        return this.launchCollision();
      case "vocabulary":
        return this.launchVocab();
    }
  }

  private launchCollision(): Observable<boolean> | void {
    if (this.collisionChallenge && !this.collisionChallenge.complete) return;
    this.collisionChallenge = new CollisionChallenge(
      Object.values(this.host.players)
        .filter((plyr) => plyr.alive)
        .map((plyr) => plyr.name),
      this.outgoing$,
      this.host
    );
    this.outgoing$.next({
      type: "collision_challenge_start",
      name: "_broadcast",
      players: this.collisionChallenge.players.length,
    });
    return this.collisionChallenge.finished$;
  }

  private launchVocab(): Observable<boolean> | void {
    if (this.vocabChallenge && !this.vocabChallenge.complete) return;
    this.vocabChallenge = new VocabularyChallenge(
      Object.values(this.host.players)
        .filter((plyr) => plyr.alive)
        .map((plyr) => plyr.name),
      this.targetManager,
      this.outgoing$,
      this.host
    );
    this.outgoing$.next({
      type: "vocabulary_challenge_start",
      name: "_broadcast",
    });
    return this.vocabChallenge.finished$;
  }
}
