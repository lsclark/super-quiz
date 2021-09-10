import { Component, Input, OnInit } from '@angular/core';
import { ModalControllerService } from '../../services/modal-controller.service';

@Component({
  selector: 'app-vocabulary-outcome',
  templateUrl: './vocabulary-outcome.component.html',
  styleUrls: ['./vocabulary-outcome.component.scss'],
})
export class VocabularyChallengeOutcomeComponent implements OnInit {
  @Input() winners!: string[];
  @Input() points!: number;
  @Input() submissions!: [string, string, boolean][];

  constructor(private modalController: ModalControllerService) {}

  ngOnInit(): void {
    this.submissions.sort(
      ([, word1], [, word2]) => word2.length - word1.length
    );
  }

  dismiss() {
    this.modalController.dismissTop();
  }

  makeList(list: string[]): string {
    switch (list.length) {
      case 0:
        return '';
      case 1:
        return list[0];
      case 2:
        return list[0] + ' and ' + list[1];
      default:
        return list.slice(0, -1).join(', ') + ', and ' + list[list.length - 1];
    }
  }
}
