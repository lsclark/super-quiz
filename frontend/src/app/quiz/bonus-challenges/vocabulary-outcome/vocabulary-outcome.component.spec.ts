import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VocabularyChallengeOutcomeComponent } from './vocabulary-outcome.component';

describe('VocabularyOutcomeComponent', () => {
  let component: VocabularyChallengeOutcomeComponent;
  let fixture: ComponentFixture<VocabularyChallengeOutcomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VocabularyChallengeOutcomeComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VocabularyChallengeOutcomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
