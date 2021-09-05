import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminQuestionDataComponent } from './question-data.component';

describe('QuestionDataComponent', () => {
  let component: AdminQuestionDataComponent;
  let fixture: ComponentFixture<AdminQuestionDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminQuestionDataComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminQuestionDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
