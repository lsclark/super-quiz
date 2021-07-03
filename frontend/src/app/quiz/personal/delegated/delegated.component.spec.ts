import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalDelegatedComponent } from './delegated.component';

describe('PersonalDelegatedComponent', () => {
  let component: PersonalDelegatedComponent;
  let fixture: ComponentFixture<PersonalDelegatedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PersonalDelegatedComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalDelegatedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
