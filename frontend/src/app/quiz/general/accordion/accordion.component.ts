import { Component, ViewChild } from "@angular/core";
import { NgbPanelChangeEvent, NgbAccordion } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-accordion",
  templateUrl: "./accordion.component.html",
  styleUrls: ["./accordion.component.scss"],
})
export class AccordionComponent {
  @ViewChild("accordion") accElement!: NgbAccordion;

  onPanelChange(event: NgbPanelChangeEvent): void {
    if (event.nextState === false) {
      event.preventDefault();
      const open =
        event.panelId == "accordion-quiz"
          ? "accordion-target"
          : "accordion-quiz";
      this.accElement.expand(open);
    }
  }
}
