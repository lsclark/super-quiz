import { Component, Input, OnInit } from "@angular/core";
import { ModalControllerService } from "../../services/modal-controller.service";

@Component({
  selector: "app-collision-outcome",
  templateUrl: "./collision-outcome.component.html",
  styleUrls: ["./collision-outcome.component.scss"],
})
export class CollisionChallengeOutcomeComponent implements OnInit {
  @Input() winner!: string;
  @Input() points!: number;
  @Input() submissions!: [string, number][];

  constructor(private modalController: ModalControllerService) {}

  ngOnInit(): void {
    this.submissions.sort(([, req1], [, req2]) => req2 - req1);
  }

  dismiss(): void {
    this.modalController.dismissTop();
  }
}
