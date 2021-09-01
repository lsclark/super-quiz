import { Component } from '@angular/core';
import { AdminGameStateService } from '../services/admin-game-state.service';

@Component({
  selector: 'app-admin-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class AdminNavigationComponent {
  constructor(public stateService: AdminGameStateService) {}
}
