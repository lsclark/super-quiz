import { Component } from "@angular/core";

import { AdminGameStateService } from "../services/admin-game-state.service";
import { AdminSessionService } from "../services/admin-session.service";

@Component({
  selector: "app-admin-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class AdminLoginComponent {
  name = "";

  constructor(
    private session: AdminSessionService,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    gss: AdminGameStateService
  ) {}

  submit(): void {
    this.session.register(this.name);
  }
}
