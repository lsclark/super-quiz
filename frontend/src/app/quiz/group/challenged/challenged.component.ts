import { Component, Input } from '@angular/core';
import { QuestionDisplay } from 'src/app/question-types';

@Component({
  selector: 'app-group-challenged',
  templateUrl: './challenged.component.html',
  styleUrls: ['./challenged.component.scss'],
})
export class GroupChallengedComponent {
  @Input() question!: QuestionDisplay;
  @Input() player!: string;
  @Input() wager!: number;
  response: string = '';
  multiChoice: number = -1;

  constructor() {}

  submit(): void {}
}
