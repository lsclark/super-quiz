import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { QuestionsService } from 'src/app/services/questions.service';
import { QuestionDisplay } from '../../question-types';

@Component({
  selector: 'app-quiz-submission',
  templateUrl: './submission.component.html',
  styleUrls: ['./submission.component.scss'],
})
export class SubmissionComponent implements OnInit {
  @Input() question!: QuestionDisplay;
  @Input() saved!: number | string;
  @Output() responseUpdate = new EventEmitter<string | number>();
  @Output() clearSelected = new EventEmitter<boolean>();
  response = new FormControl('');

  constructor(private questionService: QuestionsService) {}

  ngOnInit() {
    if (typeof this.saved == 'string') this.response.setValue(this.saved);
  }

  responseChanged() {
    this.responseUpdate.emit(this.response.value);
  }

  selectChoice(event: number) {
    console.log(event);
    this.responseUpdate.emit(event);
  }

  removeOverlay() {
    this.clearSelected.emit(true);
  }

  submit() {
    this.questionService.submitAnswer(this.question.index, this.response.value);
    this.removeOverlay();
  }
}
