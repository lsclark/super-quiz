import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabScoreComponent } from './tab-score.component';

describe('TabScoreComponent', () => {
  let component: TabScoreComponent;
  let fixture: ComponentFixture<TabScoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TabScoreComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TabScoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
