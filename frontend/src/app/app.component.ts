import { Component } from '@angular/core';
import { TimeoutService } from './services/timeout.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(timeout: TimeoutService) {}
}
