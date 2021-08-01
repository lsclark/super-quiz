import { Component } from '@angular/core';
import { QuestionColumn, QuestionDisplay } from 'src/app/message-types';
import { QuestionsService } from '../services/questions.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
})
export class QuizComponent {
  columns: QuestionColumn[];
  questions: { [index: number]: QuestionDisplay };

  constructor(private questionService: QuestionsService) {
    this.columns = [];
    this.questions = {};
    this.questionService.questions$?.pipe(first()).subscribe((msg) => {
      this.columns = msg;
      this.parseQuestions();
    });
  }

  private parseQuestions() {
    for (const column of this.columns) {
      for (const quest of column.questions) {
        quest.points = column.points;
        this.questions[quest.index] = quest;
      }
    }
  }
}
