import { Component, OnInit } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';

enum stage {
  Pre_mining = 'pre-mining',
  Mining = 'mining',
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public selectedStage: string;
  public preMiningStage = stage.Pre_mining;
  public miningStage = stage.Mining;

  constructor() {
    this.selectedStage = stage.Pre_mining;
  }

  ngOnInit(): void {}

  public onStageChange(event: MatButtonToggleChange) {
    this.selectedStage = event.value;
  }
}
