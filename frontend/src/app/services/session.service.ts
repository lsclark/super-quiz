import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  username: string;

  constructor() {
    this.username = 'tester';
  }
}
