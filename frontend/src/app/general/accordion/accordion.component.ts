import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbPanelChangeEvent, NgbAccordion } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-accordion',
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss'],
})
export class AccordionComponent implements OnInit {
  @ViewChild('accordion') accElement!: NgbAccordion;

  constructor() {}

  ngOnInit(): void {}

  onPanelChange(event: NgbPanelChangeEvent) {
    console.log(event);
    if (event.nextState === false) {
      event.preventDefault();
      let open =
        event.panelId == 'accordion-quiz'
          ? 'accordion-target'
          : 'accordion-quiz';
      this.accElement.expand(open);
    }
  }
}
