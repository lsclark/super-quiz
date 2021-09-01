import { Component } from '@angular/core';
import { GameStateService } from '../services/game-state.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent {
  constructor(public stateService: GameStateService) {}
}
