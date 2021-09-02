import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  TemplateRef,
  AfterViewInit,
} from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { ThreeService } from '../services/three.service';
import { FileCombination, PinAndMediaPath } from '../type/3d-model';
import * as HomeConstants from './home.constants';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public selectedStage: string;
  public preMiningStage = HomeConstants.stage.Pre_mining;
  public miningStage = HomeConstants.stage.Mining;
  public videoPath = HomeConstants.mp4Path;

  @ViewChild('rendererCanvas', { static: false })
  public rendererCanvas!: ElementRef<HTMLCanvasElement>;

  @ViewChild('videoTemplate')
  private videoTemplate!: TemplateRef<any>;

  constructor(public dialog: MatDialog, private threeService: ThreeService) {
    this.selectedStage = HomeConstants.stage.Pre_mining;
  }

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.animateModels();
  }

  public openDialog() {
    this.dialog.open(this.videoTemplate);
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
      this.threeService.createScene(
        this.rendererCanvas,
        paths,
        this.pinAndMediaPath
      );
      this.threeService.animate();
    }
  }

  private get pinAndMediaPath(): PinAndMediaPath {
    return {
      pin: HomeConstants.pinPath,
      mediaId: 'video',
      mediaBtnId: 'videoDialogBtn',
    };
  }
}
