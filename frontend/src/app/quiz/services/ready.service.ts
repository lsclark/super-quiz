import { Injectable } from '@angular/core';
import { merge } from 'rxjs';
import { QuestionsService } from './questions.service';
import { TargetService } from './target.service';

@Injectable({
  providedIn: 'root',
})
export class ReadyService {
  ready: boolean = false;

  constructor(
    private questionService: QuestionsService,
    private targetService: TargetService
  ) {
    this.ready = this.testReady();
    merge(this.questionService.ready$, this.targetService.ready$).subscribe(
      () => {
        this.ready = this.testReady();
      }
    );
  }

  private testReady(): boolean {
    return this.questionService.ready && this.targetService.ready;
  }
}
