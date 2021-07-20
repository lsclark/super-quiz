import {
  Component,
  Input,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { TargetService } from 'src/app/services/target.service';
import { TargetInputComponent } from '../input/input.component';
import { TargetLetters, TargetState } from '../message-types';

const NUMINPUTS = 8 * 3;

@Component({
  selector: 'app-target',
  templateUrl: './target.component.html',
  styleUrls: ['./target.component.scss'],
})
export class TargetComponent implements OnInit {
  @ViewChildren(TargetInputComponent) inputs!: QueryList<TargetInputComponent>;
  @Input() targetSpec!: TargetLetters;
  letters: string;
  columns!: TargetState[][];

  constructor(private targetService: TargetService) {
    console.log('CONSTRUT TARGET');
    this.letters = '';
    this.columns = [[], [], []];
    [...Array(NUMINPUTS).keys()]
      .map((val) => {
        return { index: val, fixed: false, input: undefined, correct: false };
      })
      .forEach((state) => {
        this.columns[state.index % 3].push(state);
      });

    targetService.results$
      ?.pipe(filter((res) => this.equivalent(res.letters)))
      .subscribe((result) => {
        let states = this.columns
          .flat(1)
          .filter((state) => state.input === result.submission);
        for (let state of states) {
          if (!result.correct) state.input = undefined;
          state.fixed = result.correct;
          state.correct = result.correct;
        }
      });
  }

  equivalent(word: string): boolean {
    return (
      this.letters.split('').sort().join() === word.split('').sort().join()
    );
  }

  ngOnInit(): void {
    this.letters = this.targetSpec.centre + this.targetSpec.others.join('');
    let idx = 0;
    for (let prev of this.targetSpec.previous) {
      this.columns
        .flat(1)
        .filter((state) => state.index == idx)
        .forEach((state) => {
          state.input = prev;
          state.correct = true;
          state.fixed = true;
        });
      idx++;
    }
  }

  makeSubmission(index: number, event: [string, boolean]) {
    let [submission, enter] = event;
    if (enter) this.changeFocus(index);
    this.columns
      .flat(1)
      .filter((state) => state.index == index)
      .forEach((state) => {
        state.input = submission;
        state.fixed = true;
      });
    this.targetService.submit(this.letters, submission);
  }

  private getNextIndex(index: number): number {
    if (index + 3 < NUMINPUTS) return index + 3;
    return (index + 1) % 3;
  }

  changeFocus(index: number) {
    // First ensure a slot exists
    if (!this.inputs.filter((component) => !component.fixed).length) return;
    let component: TargetInputComponent | undefined = undefined;
    do {
      index = this.getNextIndex(index);
      component = this.inputs.filter((comp) => comp.index == index)[0];
    } while (component?.fixed);
    console.log('nextindex=', index);
    component.makeFocus();
  }
}
