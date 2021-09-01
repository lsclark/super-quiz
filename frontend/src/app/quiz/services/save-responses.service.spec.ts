import { TestBed } from '@angular/core/testing';

import { SaveResponsesService } from './save-responses.service';

describe('SaveResponsesService', () => {
  let service: SaveResponsesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SaveResponsesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
