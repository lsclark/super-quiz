import { Component } from "@angular/core";

import { AdminGameStateService } from "../services/admin-game-state.service";
import { ViewManagerService } from "../services/view-manager.service";

@Component({
  selector: "app-admin-navigation",
  templateUrl: "./navigation.component.html",
  styleUrls: ["./navigation.component.scss"],
})
export class AdminNavigationComponent {
  constructor(
    public stateService: AdminGameStateService,
    private viewManager: ViewManagerService
  ) {}

  selectPlayer(player: string): void {
    this.viewManager.showPlayer(player);
  }

  viewMain(): void {
    this.viewManager.viewMain();
  }
}
