import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CookieService } from 'ngx-cookie-service';

import { AdminComponent } from './admin/admin.component';
import { AdminLoginComponent } from './admin/login/login.component';
import { MainComponent } from './admin/main/main.component';
import { AdminNavigationComponent } from './admin/navigation/navigation.component';
import { AdminPlayerStateComponent } from './admin/player-state/player-state.component';
import { AdminQuestionDataComponent } from './admin/question-data/question-data.component';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CollisionChallengeComponent } from './quiz/bonus-challenges/collision/collision.component';
import { CollisionChallengeOutcomeComponent } from './quiz/bonus-challenges/collision-outcome/collision-outcome.component';
import { VocabularyChallengeComponent } from './quiz/bonus-challenges/vocabulary/vocabulary.component';
import { VocabularyChallengeOutcomeComponent } from './quiz/bonus-challenges/vocabulary-outcome/vocabulary-outcome.component';
import { AccordionComponent } from './quiz/general/accordion/accordion.component';
import { LoginComponent } from './quiz/general/login/login.component';
import { NavbarComponent } from './quiz/general/navbar/navbar.component';
import { NotificationComponent } from './quiz/general/notification/notification.component';
import { ScoresComponent } from './quiz/general/scores/scores.component';
import { WaitComponent } from './quiz/general/wait/wait.component';
import { ColumnComponent } from './quiz/quiz/column/column.component';
import { GroupChallengedComponent } from './quiz/quiz/group/challenged/challenged.component';
import { GroupOriginatorComponent } from './quiz/quiz/group/originator/originator.component';
import { PersonalDelegatedComponent } from './quiz/quiz/personal/delegated/delegated.component';
import { PersonalOriginatorComponent } from './quiz/quiz/personal/originator/originator.component';
import { QuestionComponent } from './quiz/quiz/question/question.component';
import { QuizComponent } from './quiz/quiz/quiz.component';
import { SolutionsComponent } from './quiz/quiz/solutions/solutions.component';
import { SubmissionComponent } from './quiz/quiz/submission/submission.component';
import { QuizMainComponent } from './quiz/quiz-main.component';
import { GridComponent } from './quiz/target/grid/grid.component';
import { TargetInputComponent } from './quiz/target/input/input.component';
import { TabScoreComponent } from './quiz/target/tab-score/tab-score.component';
import { TabbingComponent } from './quiz/target/tabbing/tabbing.component';
import { TargetComponent } from './quiz/target/target/target.component';

@NgModule({
  declarations: [
    AppComponent,
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
    AdminQuestionDataComponent,
    MainComponent,
    VocabularyChallengeComponent,
    CollisionChallengeComponent,
    CollisionChallengeOutcomeComponent,
    VocabularyChallengeOutcomeComponent,
    TabScoreComponent,
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
