import { TestBed } from '@angular/core/testing';

import { BonusChallengeService } from './bonus-challenge.service';

describe('BonusChallengeService', () => {
  let service: BonusChallengeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BonusChallengeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
