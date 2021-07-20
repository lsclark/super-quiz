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

  constructor(public targetService: TargetService) {}

  logEvent(event: any) {
    console.log(event);
  }
}
