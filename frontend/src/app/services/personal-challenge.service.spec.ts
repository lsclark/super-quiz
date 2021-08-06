import { TestBed } from '@angular/core/testing';

import { PersonalChallengeService } from './personal-challenge.service';

describe('PersonalChallengeService', () => {
  let service: PersonalChallengeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersonalChallengeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
