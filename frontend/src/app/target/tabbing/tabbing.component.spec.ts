import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabbingComponent } from './tabbing.component';

describe('TabbingComponent', () => {
  let component: TabbingComponent;
  let fixture: ComponentFixture<TabbingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TabbingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TabbingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
