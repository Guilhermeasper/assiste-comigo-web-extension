import { Component, OnInit } from '@angular/core';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass'],
})
export class HomeComponent implements OnInit {
  public name = 'Guilherme';

  constructor() {}

  ngOnInit(): void {}
}
