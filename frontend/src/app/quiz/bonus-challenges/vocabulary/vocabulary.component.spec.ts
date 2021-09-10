import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VocabularyChallengeComponent } from './vocabulary.component';

describe('VocabularyComponent', () => {
  let component: VocabularyChallengeComponent;
  let fixture: ComponentFixture<VocabularyChallengeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VocabularyChallengeComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VocabularyChallengeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
