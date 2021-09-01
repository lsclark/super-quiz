import { Component } from '@angular/core';
import { AdminSessionService } from './services/admin-session.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent {
  title = 'admin';

  constructor(public session: AdminSessionService) {}
}
