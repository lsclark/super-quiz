import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupChallengedComponent } from './challenged.component';

describe('GroupChallengedComponent', () => {
  let component: GroupChallengedComponent;
  let fixture: ComponentFixture<GroupChallengedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GroupChallengedComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupChallengedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
