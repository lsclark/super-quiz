import { Component, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { QuestionDisplay } from 'src/app/models/quiz-message-types';
import { GroupChallengeService } from 'src/app/quiz/services/group-challenge.service';
import { ModalControllerService } from 'src/app/quiz/services/modal-controller.service';
import { PlayersService } from 'src/app/quiz/services/players.service';

@Component({
  selector: 'app-group-originator',
  templateUrl: './originator.component.html',
  styleUrls: ['./originator.component.scss'],
})
export class GroupOriginatorComponent {
  @Input() question!: QuestionDisplay;
  wager: number = 3.0;
  wagerChanges = new Subject<true>();

  constructor(
    public modalController: ModalControllerService,
    public playerService: PlayersService,
    private groupChallengeSvc: GroupChallengeService
  ) {
    this.wagerChanges
      .pipe(debounceTime(1000))
      .subscribe(() => this.validateWager());
  }

  validateWager() {
    if (this.wager < 3.0) this.wager = 3.0;
    if (this.wager > this.playerService.score)
      this.wager = this.playerService.score;
    this.wager = Math.round(this.wager * 1000) / 1000;
  }

  wagerChanged() {
    this.wagerChanges.next(true);
  }

  submit() {
    this.validateWager();
    this.groupChallengeSvc.sendChallenge(this.question, this.wager);
    this.modalController.dismissTop(this.question.index);
  }
}
