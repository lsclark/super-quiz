import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollisionChallengeOutcomeComponent } from './collision-outcome.component';

describe('CollisionOutcomeComponent', () => {
  let component: CollisionChallengeOutcomeComponent;
  let fixture: ComponentFixture<CollisionChallengeOutcomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CollisionChallengeOutcomeComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollisionChallengeOutcomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
