import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  username: string = '';
  registered: boolean = false;
  registration$ = new Subject<boolean>();

  register(username: string) {
    if (username) {
      this.username = username;
      this.cookies.set('username', username);
      this.registered = true;
      this.registration$.next(true);
    }
  }

  constructor(private cookies: CookieService) {
    if (this.cookies.check('username')) {
      this.username = this.cookies.get('username');
      if (this.username) {
        this.registered = true;
        this.registration$.next(true);
      }
    }
  }
}
