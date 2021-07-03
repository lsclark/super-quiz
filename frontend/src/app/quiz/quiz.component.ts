import { Component } from '@angular/core';
import { QuestionColumn, QuestionDisplay } from 'src/app/question-types';
import { QuestionsService } from '../services/questions.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
})
export class QuizComponent {
  columns: QuestionColumn[];
  selected?: number;
  questions: { [index: number]: QuestionDisplay };
  saves: { [key: number]: string | number };

  constructor(private questionService: QuestionsService) {
    this.columns = [];
    this.questions = {};
    this.saves = {};
    questionService.questions$?.pipe(first()).subscribe((msg) => {
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
    Object.keys(this.questions).forEach((index) => {
      this.saves[Number(index)] = '';
    });
  }

  questionSelected(index: number) {
    this.selected = index;
  }

  questionDeselect() {
    this.selected = undefined;
  }

  updateSavedResponses(value: number | string) {
    if (this.selected !== undefined) this.saves[this.selected] = value;
  }
}
