import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SaveResponsesService {
  saves: { [index: number]: string | number };

  constructor() {
    this.saves = {};
  }

  get(index: number): string | number {
    return this.saves[index];
  }

  set(index: number, value: string | number) {
    this.saves[index] = value;
  }
}
