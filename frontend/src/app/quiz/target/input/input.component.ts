import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";

@Component({
  selector: "app-target-input",
  templateUrl: "./input.component.html",
  styleUrls: ["./input.component.scss"],
})
export class TargetInputComponent implements OnInit, OnChanges {
  @Input() fixed!: boolean;
  @Input() correct!: boolean;
  @Input() input?: string;
  @Input() index!: number;
  @Output() submission = new EventEmitter<[string, boolean]>();
  inputValue = "";
  @ViewChild("input") inputElement!: ElementRef;

  debounceSubmit$ = new Subject<boolean>();

  constructor() {
    this.debounceSubmit$.pipe(debounceTime(500)).subscribe((enter) => {
      this.submission.emit([this.inputValue, enter]);
    });
  }

  ngOnInit(): void {
    this.inputValue = this.input ?? "";
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !!changes.input &&
      !changes.input.currentValue &&
      !!changes.input.previousValue
    ) {
      this.inputValue = "";
    }
  }

  enterPressed(): void {
    this.submitWord(true);
  }

  submitWord(enter = false): void {
    if (this.inputValue.length > 0 && !this.fixed) {
      this.debounceSubmit$.next(enter);
    }
  }

  makeFocus(): void {
    setTimeout(() => {
      this.inputElement.nativeElement.focus();
    }, 0);
  }
}
