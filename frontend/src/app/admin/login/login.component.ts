import { Component } from '@angular/core';
import { SessionService } from 'src/app/quiz/services/session.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class AdminLoginComponent {
  name: string = '';

  constructor(private session: SessionService) {}

  submit() {
    this.session.register(this.name);
  }
}
