import { Component } from '@angular/core';
import { QuestionColumn, QuestionDisplay } from 'src/app/message-types';
import { QuestionsService } from '../services/questions.service';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
})
export class QuizComponent {
  questions: { [index: number]: QuestionDisplay } = {};

  constructor(public questionService: QuestionsService) {
    this.parseQuestions(this.questionService.questions);
  }

  private parseQuestions(columns: QuestionColumn[]) {
    for (const column of columns) {
      for (const quest of column.questions) {
        quest.points = column.points;
        this.questions[quest.index] = quest;
      }
    }
  }
}
