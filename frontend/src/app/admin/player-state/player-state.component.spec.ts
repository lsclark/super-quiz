import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerStateComponent } from './player-state.component';

describe('PlayerStateComponent', () => {
  let component: PlayerStateComponent;
  let fixture: ComponentFixture<PlayerStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayerStateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
