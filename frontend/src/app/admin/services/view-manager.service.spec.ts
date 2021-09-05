import { TestBed } from '@angular/core/testing';

import { ViewManagerService } from './view-manager.service';

describe('ViewManagerService', () => {
  let service: ViewManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ViewManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
