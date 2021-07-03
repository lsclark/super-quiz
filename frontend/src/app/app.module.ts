import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ColumnComponent } from './quiz/column/column.component';
import { QuestionComponent } from './quiz/column/question/question.component';
import { QuizComponent } from './quiz/quiz.component';
import { SubmissionComponent } from './quiz/submission/submission.component';
import { SolutionsComponent } from './quiz/solutions/solutions.component';
import { ScoresComponent } from './general/scores/scores.component';
import { GroupChallengedComponent } from './quiz/group/challenged/challenged.component';
import { GroupOriginatorComponent } from './quiz/group/originator/originator.component';
import { PersonalDelegatedComponent } from './quiz/personal/delegated/delegated.component';
import { PersonalOriginatorComponent } from './quiz/personal/originator/originator.component';

@NgModule({
  declarations: [
    AppComponent,
    ColumnComponent,
    QuestionComponent,
    QuizComponent,
    SubmissionComponent,
    SolutionsComponent,
    ScoresComponent,
    GroupChallengedComponent,
    GroupOriginatorComponent,
    PersonalDelegatedComponent,
    PersonalOriginatorComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, ReactiveFormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
