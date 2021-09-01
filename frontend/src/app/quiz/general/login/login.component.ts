import { Component } from '@angular/core';
import { SessionService } from 'src/app/quiz/services/session.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  name: string = '';

  constructor(private session: SessionService) {}

  submit() {
    this.session.register(this.name);
  }
}
