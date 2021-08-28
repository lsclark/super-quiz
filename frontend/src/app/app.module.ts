import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { CookieService } from 'ngx-cookie-service';

import { AppComponent } from './app.component';
import { ColumnComponent } from './quiz/column/column.component';
import { QuestionComponent } from './quiz/question/question.component';
import { QuizComponent } from './quiz/quiz.component';
import { SubmissionComponent } from './quiz/submission/submission.component';
import { SolutionsComponent } from './quiz/solutions/solutions.component';
import { ScoresComponent } from './general/scores/scores.component';
import { GroupChallengedComponent } from './quiz/group/challenged/challenged.component';
import { GroupOriginatorComponent } from './quiz/group/originator/originator.component';
import { PersonalDelegatedComponent } from './quiz/personal/delegated/delegated.component';
import { PersonalOriginatorComponent } from './quiz/personal/originator/originator.component';
import { NotificationComponent } from './general/notification/notification.component';
import { NavbarComponent } from './general/navbar/navbar.component';
import { TargetComponent } from './target/target/target.component';
import { AccordionComponent } from './general/accordion/accordion.component';
import { GridComponent } from './target/grid/grid.component';
import { TargetInputComponent } from './target/input/input.component';
import { TabbingComponent } from './target/tabbing/tabbing.component';
import { LoginComponent } from './general/login/login.component';
import { WaitComponent } from './general/wait/wait.component';

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
    NavbarComponent,
    TargetComponent,
    AccordionComponent,
    GridComponent,
    TargetInputComponent,
    TabbingComponent,
    NotificationComponent,
    LoginComponent,
    WaitComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
  ],
  providers: [CookieService],
  bootstrap: [AppComponent],
})
export class AppModule {}
