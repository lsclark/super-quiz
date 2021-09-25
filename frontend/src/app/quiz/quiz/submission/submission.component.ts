import { Component, Input, OnInit } from "@angular/core";
import { GroupChallengeService } from "src/app/quiz/services/group-challenge.service";

import { ModalControllerService } from "src/app/quiz/services/modal-controller.service";
import { PersonalChallengeService } from "src/app/quiz/services/personal-challenge.service";
import { QuestionsService } from "src/app/quiz/services/questions.service";
import { SaveResponsesService } from "src/app/quiz/services/save-responses.service";
import { QuestionDisplay } from "../../../models/quiz-message-types";

@Component({
  selector: "app-quiz-submission",
  templateUrl: "./submission.component.html",
  styleUrls: ["./submission.component.scss"],
})
export class SubmissionComponent implements OnInit {
  @Input() question!: QuestionDisplay;
  response = "";
  multiChoice = -1;

  constructor(
    private modalController: ModalControllerService,
    private questionService: QuestionsService,
    private saveService: SaveResponsesService,
    private groupChallengeSvc: GroupChallengeService,
    private personalChallengeSvc: PersonalChallengeService
  ) {}

  ngOnInit(): void {
    this.restoreSaved();
  }

  responseChanged(): void {
    this.saveService.set(this.question.index, this.response);
  }

  restoreSaved(): void {
    const saved = this.saveService.get(this.question.index);
    if (typeof saved == "string") this.response = saved;
    if (typeof saved == "number") this.multiChoice = saved;
  }

  selectChoice(event: number): void {
    this.saveService.set(this.question.index, event);
    this.multiChoice = event;
  }

  dismiss(): void {
    this.modalController.dismissTop();
  }

  submit(): void {
    this.questionService.submitAnswer(this.question.index);
    this.modalController.dismissTop();
  }

  groupChallenge(): void {
    this.groupChallengeSvc.initiate(this.question);
  }

  personalChallenge(): void {
    this.personalChallengeSvc.initiate(this.question);
  }
}
