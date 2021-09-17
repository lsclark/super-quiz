import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ViewManagerService {
  player?: string;

  showPlayer(player: string) {
    this.player = player;
  }

  viewMain() {
    this.player = undefined;
  }
}
