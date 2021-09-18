import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { QuestionsService } from './questions.service';
import { TargetService } from './target.service';

@Injectable({
  providedIn: 'root',
})
export class ReadyService {
  ready$ = new BehaviorSubject<boolean>(false);

  constructor(
    private questionService: QuestionsService,
    private targetService: TargetService
  ) {
    combineLatest([
      this.questionService.ready$,
      this.targetService.ready$,
    ]).subscribe(
      ([qsReady, tsReady]) => qsReady && tsReady && this.ready$.next(true)
    );
  }
}
