import { Component } from '@angular/core';
import { AdminGameStateService } from '../services/admin-game-state.service';

@Component({
  selector: 'app-admin-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent {
  constructor(public gameStateService: AdminGameStateService) {}
}
