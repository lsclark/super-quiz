import { TestBed } from '@angular/core/testing';

import { ReadyService } from './ready.service';

describe('ReadyService', () => {
  let service: ReadyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReadyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
