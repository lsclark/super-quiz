import { Component } from '@angular/core';
import { ReadyService } from './services/ready.service';
import { SessionService } from './services/session.service';
import { TimeoutService } from './services/timeout.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(
    timeout: TimeoutService,
    public session: SessionService,
    public readyService: ReadyService
  ) {}
}
