import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollisionChallengeComponent } from './collision.component';

describe('CollisionComponent', () => {
  let component: CollisionChallengeComponent;
  let fixture: ComponentFixture<CollisionChallengeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CollisionChallengeComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollisionChallengeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
