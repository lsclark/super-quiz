import { Component, Input, OnInit } from '@angular/core';
import { TargetLetters } from '../message-types';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
})
export class GridComponent implements OnInit {
  @Input() targetData!: TargetLetters;
  ordering?: string[][];

  constructor() {}

  ngOnInit(): void {
    this.shuffleLetters();
  }

  shuffleLetters() {
    let shuffled = this.targetData.others
      .map((char) => ({ sort: Math.random(), value: char }))
      .sort((a, b) => a.sort - b.sort)
      .map((a) => a.value);
    this.ordering = [
      shuffled.slice(0, 3),
      [shuffled[3], this.targetData.centre, shuffled[4]],
      shuffled.slice(5),
    ];
  }
}
