import { Component } from '@angular/core';
import { QuestionsService } from '../../../services/questions.service';

@Component({
  selector: 'app-solutions',
  templateUrl: './solutions.component.html',
  styleUrls: ['./solutions.component.scss'],
})
export class SolutionsComponent {
  constructor(public questionService: QuestionsService) {}
}
