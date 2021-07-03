import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupOriginatorComponent } from './originator.component';

describe('GroupOriginatorComponent', () => {
  let component: GroupOriginatorComponent;
  let fixture: ComponentFixture<GroupOriginatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GroupOriginatorComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupOriginatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
