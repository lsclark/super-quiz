import { Component } from '@angular/core';
import { ReadyService } from './services/ready.service';
import { SessionService } from './services/session.service';
import { TimeoutService } from './services/timeout.service';

@Component({
  selector: 'app-quiz-main',
  templateUrl: './quiz-main.component.html',
  styleUrls: ['./quiz-main.component.scss'],
})
export class QuizMainComponent {
  title = 'Super Quiz';
  constructor(
    timeout: TimeoutService,
    public session: SessionService,
    public readyService: ReadyService
  ) {}
}
