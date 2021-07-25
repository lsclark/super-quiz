import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalResultOriginComponent } from './result-origin.component';

describe('ResultOriginComponent', () => {
  let component: PersonalResultOriginComponent;
  let fixture: ComponentFixture<PersonalResultOriginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PersonalResultOriginComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalResultOriginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
