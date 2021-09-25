import { Component, Input } from "@angular/core";
import { QuestionDisplay } from "src/app/models/quiz-message-types";
import { ModalControllerService } from "src/app/quiz/services/modal-controller.service";
import { PersonalChallengeService } from "src/app/quiz/services/personal-challenge.service";
import { PlayersService } from "src/app/quiz/services/players.service";

@Component({
  selector: "app-personal-originator",
  templateUrl: "./originator.component.html",
  styleUrls: ["./originator.component.scss"],
})
export class PersonalOriginatorComponent {
  @Input() question!: QuestionDisplay;
  delegate?: string;

  constructor(
    public modalController: ModalControllerService,
    public playerService: PlayersService,
    private personalChallengeSvc: PersonalChallengeService
  ) {}

  submit(): void {
    if (this.delegate) {
      this.personalChallengeSvc.sendChallenge(this.question, this.delegate);
      this.modalController.dismissTop(this.question.index);
    }
  }
}
