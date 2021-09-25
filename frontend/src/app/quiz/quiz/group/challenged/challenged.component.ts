import { Component, Input } from '@angular/core';
import { QuestionDisplay } from 'src/app/models/quiz-message-types';
import { GroupChallengeService } from 'src/app/quiz/services/group-challenge.service';
import { ModalControllerService } from 'src/app/quiz/services/modal-controller.service';

@Component({
  selector: 'app-group-challenged',
  templateUrl: './challenged.component.html',
  styleUrls: ['./challenged.component.scss'],
})
export class GroupChallengedComponent {
  @Input() question!: QuestionDisplay;
  @Input() player!: string;
  @Input() wager!: number;
  response = '';
  multiChoice = -1;

  constructor(
    private groupChallengeSvc: GroupChallengeService,
    private modalController: ModalControllerService
  ) {}

  submit(): void {
    let submission: undefined | string | number = undefined;
    if (this.question.choices?.length && this.multiChoice >= 0) {
      submission = this.multiChoice;
    } else if (this.response.length) {
      submission = this.response;
    }
    if (submission !== undefined) {
      this.groupChallengeSvc.submitAnswer(
        this.player,
        this.question,
        submission
      );
      this.modalController.dismissTop();
    }
  }
}
