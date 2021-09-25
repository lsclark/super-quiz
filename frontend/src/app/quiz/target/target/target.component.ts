import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  AfterContentInit,
  Output,
  QueryList,
  ViewChildren,
} from "@angular/core";
import { filter } from "rxjs/operators";
import { TargetService } from "src/app/quiz/services/target.service";
import { TargetInputComponent } from "../input/input.component";
import { TargetLetters, TargetState } from "../message-types";

const NUMINPUTS = 10 * 3;

@Component({
  selector: "app-target",
  templateUrl: "./target.component.html",
  styleUrls: ["./target.component.scss"],
})
export class TargetComponent implements OnInit, AfterContentInit {
  @ViewChildren(TargetInputComponent) inputs!: QueryList<TargetInputComponent>;
  @Input() targetSpec!: TargetLetters;
  letters: string;
  columns!: TargetState[][];
  @Output() scoreUpdate = new EventEmitter<number>();

  constructor(private targetService: TargetService) {
    this.letters = "";
    this.columns = [[], [], []];
    [...Array(NUMINPUTS).keys()]
      .map((val) => {
        return { index: val, fixed: false, input: undefined, correct: false };
      })
      .forEach((state) => {
        this.columns[state.index % 3].push(state);
      });
  }

  ngOnInit(): void {
    this.scoreUpdate.emit(this.targetSpec.initScore);
    this.letters = this.targetSpec.centre + this.targetSpec.others.join("");
    let idx = 0;
    for (const prev of this.targetSpec.previous) {
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

  ngAfterContentInit(): void {
    this.targetService.results$
      ?.pipe(
        filter((res) =>
          this.targetService.equivalent(res.letters, this.letters)
        )
      )
      .subscribe((result) => {
        this.scoreUpdate.emit(result.score);
        const states = this.columns
          .flat(1)
          .filter((state) => state.input === result.submission);
        for (const state of states) {
          if (!result.correct) state.input = undefined;
          state.fixed = result.correct;
          state.correct = result.correct;
        }
      });
  }

  makeSubmission(index: number, event: [string, boolean]): void {
    const [submission, enter] = event;
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

  changeFocus(index: number): void {
    // First ensure a slot exists
    if (!this.inputs.filter((component) => !component.fixed).length) return;
    let component: TargetInputComponent | undefined = undefined;
    do {
      index = this.getNextIndex(index);
      component = this.inputs.filter((comp) => comp.index == index)[0];
    } while (component?.fixed);
    component.makeFocus();
  }
}
