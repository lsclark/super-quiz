import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupResultWinnerComponent } from './result-winner.component';

describe('ResultWinnerComponent', () => {
  let component: GroupResultWinnerComponent;
  let fixture: ComponentFixture<GroupResultWinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GroupResultWinnerComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupResultWinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
