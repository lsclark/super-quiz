import { Component, Input } from '@angular/core';
import { QuestionDisplay } from 'src/app/question-types';

@Component({
  selector: 'app-personal-delegated',
  templateUrl: './delegated.component.html',
  styleUrls: ['./delegated.component.scss'],
})
export class PersonalDelegatedComponent {
  @Input() question!: QuestionDisplay;
  @Input() player!: string;
  response: string = '';
  multiChoice: number = -1;

  constructor() {}

  submit() {}
}
