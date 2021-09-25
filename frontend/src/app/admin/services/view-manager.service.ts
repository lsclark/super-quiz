import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class ViewManagerService {
  player?: string;

  showPlayer(player: string): void {
    this.player = player;
  }

  viewMain(): void {
    this.player = undefined;
  }
}
