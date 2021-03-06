import { Component, Input } from "@angular/core";
import { QuestionDisplay } from "src/app/models/quiz-message-types";
import { ModalControllerService } from "src/app/quiz/services/modal-controller.service";
import { PersonalChallengeService } from "src/app/quiz/services/personal-challenge.service";

@Component({
  selector: "app-personal-delegated",
  templateUrl: "./delegated.component.html",
  styleUrls: ["./delegated.component.scss"],
})
export class PersonalDelegatedComponent {
  @Input() question!: QuestionDisplay;
  @Input() player!: string;
  response = "";
  multiChoice = -1;

  constructor(
    private modalController: ModalControllerService,
    private personalChallengeSvc: PersonalChallengeService
  ) {}

  submit(): void {
    let submission: undefined | string | number = undefined;
    if (this.question.choices?.length && this.multiChoice >= 0) {
      submission = this.multiChoice;
    } else if (this.response.length) {
      submission = this.response;
    }
    if (submission !== undefined) {
      this.personalChallengeSvc.submitAnswer(
        this.player,
        this.question,
        submission
      );
      this.modalController.dismissTop();
    }
  }
}
