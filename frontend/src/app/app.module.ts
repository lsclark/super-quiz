import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CookieService } from 'ngx-cookie-service';

import { AppRoutingModule } from './app-routing.module';

import { QuizMainComponent } from './quiz/quiz-main.component';
import { ColumnComponent } from './quiz/quiz/column/column.component';
import { QuestionComponent } from './quiz/quiz/question/question.component';
import { QuizComponent } from './quiz/quiz/quiz.component';
import { SubmissionComponent } from './quiz/quiz/submission/submission.component';
import { SolutionsComponent } from './quiz/quiz/solutions/solutions.component';
import { ScoresComponent } from './quiz/general/scores/scores.component';
import { GroupChallengedComponent } from './quiz/quiz/group/challenged/challenged.component';
import { GroupOriginatorComponent } from './quiz/quiz/group/originator/originator.component';
import { PersonalDelegatedComponent } from './quiz/quiz/personal/delegated/delegated.component';
import { PersonalOriginatorComponent } from './quiz/quiz/personal/originator/originator.component';
import { NotificationComponent } from './quiz/general/notification/notification.component';
import { NavbarComponent } from './quiz/general/navbar/navbar.component';
import { TargetComponent } from './quiz/target/target/target.component';
import { AccordionComponent } from './quiz/general/accordion/accordion.component';
import { GridComponent } from './quiz/target/grid/grid.component';
import { TargetInputComponent } from './quiz/target/input/input.component';
import { TabbingComponent } from './quiz/target/tabbing/tabbing.component';
import { LoginComponent } from './quiz/general/login/login.component';
import { WaitComponent } from './quiz/general/wait/wait.component';

import { AdminLoginComponent } from './admin/login/login.component';
import { AdminNavigationComponent } from './admin/navigation/navigation.component';
import { AdminPlayerStateComponent } from './admin/player-state/player-state.component';
import { AdminComponent } from './admin/admin.component';

@NgModule({
  declarations: [
    QuizMainComponent,
    AdminComponent,
    AdminLoginComponent,
    AdminNavigationComponent,
    AdminPlayerStateComponent,
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
  bootstrap: [QuizMainComponent],
})
export class AppModule {}
