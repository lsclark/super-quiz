import { Component, ViewChild } from '@angular/core';
import { NgbNav } from '@ng-bootstrap/ng-bootstrap';
import { TargetService } from 'src/app/services/target.service';

@Component({
  selector: 'app-target-tabbing',
  templateUrl: './tabbing.component.html',
  styleUrls: ['./tabbing.component.scss'],
})
export class TabbingComponent {
  active: number = 0;
  @ViewChild('nav') navElement!: NgbNav;
  tabScores: { [index: number]: number };
  scored: number;

  constructor(public targetService: TargetService) {
    this.scored = -1;
    this.tabScores = {};
  }

  logEvent(event: any) {
    console.log(event);
  }

  receiveScore(index: number, score: number) {
    this.tabScores[index] = score;
    if (score == Math.max(...Object.values(this.tabScores)))
      this.scored = index;
  }
}
