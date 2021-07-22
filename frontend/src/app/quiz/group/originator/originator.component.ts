import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { QuestionDisplay } from 'src/app/question-types';
import { PlayersService } from 'src/app/services/players.service';

@Component({
  selector: 'app-group-originator',
  templateUrl: './originator.component.html',
  styleUrls: ['./originator.component.scss'],
})
export class GroupOriginatorComponent implements OnInit {
  @Input() question!: QuestionDisplay;

  constructor(
    public activeModal: NgbActiveModal,
    public playerService: PlayersService
  ) {}

  ngOnInit(): void {}
}
