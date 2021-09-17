import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'frontend';

  ngOnInit(): void {
    console.log(
      'Nothing to see here. Why not have some points for your trouble' +
        " - be the first to announce that you've seen this message " +
        'and get 4 points. Or... Get another player to say the word ' +
        '"Bubbles" without saying it yourself, before someone else ' +
        'claims these points, and get 8. '
    );
  }
}
