import { TestBed } from '@angular/core/testing';

import { AdminSessionService } from './admin-session.service';

describe('SessionService', () => {
  let service: AdminSessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminSessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
