import { Component, Input, OnInit } from '@angular/core';
import { filter } from 'rxjs/operators';

import { TargetService } from '../../services/target.service';
import { TargetLetters, TargetResult } from '../message-types';

@Component({
  selector: 'app-quiz-target-tab-score',
  templateUrl: './tab-score.component.html',
  styleUrls: ['./tab-score.component.scss'],
})
export class TabScoreComponent implements OnInit {
  @Input() targetSpec!: TargetLetters;
  letters = '';
  score = 0;
  maximum = false;

  constructor(private targetService: TargetService) {
    this.targetService.results$
      ?.pipe(
        filter((res) =>
          this.targetService.equivalent(res.letters, this.letters)
        )
      )
      .subscribe((res: TargetResult) => {
        this.score = res.score;
        this.maximum = res.maximum ?? false;
      });
  }
  ngOnInit(): void {
    this.letters = [this.targetSpec.centre, ...this.targetSpec.others].join('');
  }
}
