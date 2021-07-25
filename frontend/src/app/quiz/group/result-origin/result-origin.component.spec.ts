import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupResultOriginComponent } from './result-origin.component';

describe('ResultOriginComponent', () => {
  let component: GroupResultOriginComponent;
  let fixture: ComponentFixture<GroupResultOriginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GroupResultOriginComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupResultOriginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
