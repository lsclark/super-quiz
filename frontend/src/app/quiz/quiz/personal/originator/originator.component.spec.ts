import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalOriginatorComponent } from './originator.component';

describe('PersonalOriginatorComponent', () => {
  let component: PersonalOriginatorComponent;
  let fixture: ComponentFixture<PersonalOriginatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PersonalOriginatorComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalOriginatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
