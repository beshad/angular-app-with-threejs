import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  NgZone,
} from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { ThreeService } from '../services/three.service';
import { FileCombination } from '../type/3d-model';
import * as HomeConstants from './home.constants';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public selectedStage: string;
  public preMiningStage = HomeConstants.stage.Pre_mining;
  public miningStage = HomeConstants.stage.Mining;

  @ViewChild('rendererCanvas', { static: false })
  public rendererCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(private threeService: ThreeService, private ngZone: NgZone) {
    this.selectedStage = HomeConstants.stage.Pre_mining;
  }

  ngOnInit(): void {}

  public ngAfterViewInit() {
    this.animateModels();
  }

  public onStageChange(event: MatButtonToggleChange) {
    this.selectedStage = event.value;
    this.animateModels();
  }

  private getFilePathsBySelectedStage(): FileCombination[] {
    return this.selectedStage === HomeConstants.stage.Pre_mining
      ? [
          HomeConstants.terrainOuterFilePath,
          HomeConstants.terrainExistingFilePath,
        ]
      : [
          HomeConstants.terrainYear16FilePath,
          HomeConstants.miningFacilitiesFilePath,
        ];
  }

  private animateModels() {
    const paths = this.getFilePathsBySelectedStage();
    if (this.rendererCanvas) {
      this.threeService.createScene(this.rendererCanvas, paths);
      this.threeService.animate();
    }
  }
}
