import { TestBed } from '@angular/core/testing';

import { GroupChallengeService } from './group-challenge.service';

describe('GroupChallengeService', () => {
  let service: GroupChallengeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GroupChallengeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
