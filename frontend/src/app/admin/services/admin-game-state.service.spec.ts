import { TestBed } from '@angular/core/testing';

import { AdminGameStateService } from './admin-game-state.service';

describe('GameStateService', () => {
  let service: AdminGameStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminGameStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
