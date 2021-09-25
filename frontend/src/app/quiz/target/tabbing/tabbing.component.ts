import { Component, ViewChild } from '@angular/core';
import { NgbNav } from '@ng-bootstrap/ng-bootstrap';
import { TargetService } from 'src/app/quiz/services/target.service';

@Component({
  selector: 'app-target-tabbing',
  templateUrl: './tabbing.component.html',
  styleUrls: ['./tabbing.component.scss'],
})
export class TabbingComponent {
  active = 0;
  @ViewChild('nav') navElement!: NgbNav;

  constructor(public targetService: TargetService) {}
}
