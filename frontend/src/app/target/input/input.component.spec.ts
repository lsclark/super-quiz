import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TargetInputComponent } from './input.component';

describe('InputComponent', () => {
  let component: TargetInputComponent;
  let fixture: ComponentFixture<TargetInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TargetInputComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TargetInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
