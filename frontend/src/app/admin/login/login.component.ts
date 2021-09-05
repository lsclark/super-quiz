import { Component } from '@angular/core';
import { AdminGameStateService } from '../services/admin-game-state.service';
import { AdminSessionService } from '../services/admin-session.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class AdminLoginComponent {
  name: string = '';

  constructor(
    private session: AdminSessionService,
    gss: AdminGameStateService
  ) {}

  submit() {
    this.session.register(this.name);
  }
}
