import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalResultDelegateComponent } from './result-delegate.component';

describe('ResultDelegateComponent', () => {
  let component: PersonalResultDelegateComponent;
  let fixture: ComponentFixture<PersonalResultDelegateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PersonalResultDelegateComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalResultDelegateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
