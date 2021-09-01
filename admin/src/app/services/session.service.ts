import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  token: string = '';
  registered: boolean = false;
  registration$ = new Subject<boolean>();

  register(token: string) {
    this.token = token;
    this.registered = true;
    this.registration$.next(true);
  }
}
