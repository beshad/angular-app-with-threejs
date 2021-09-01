import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  NgZone,
} from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { ThreeService } from '../services/three.service';

enum stage {
  Pre_mining = 'pre-mining',
  Mining = 'mining',
}

export interface FileCombination {
  gltfPath: string;
  texturePath: string[];
}

const terrainOuterFilePath: FileCombination = {
  gltfPath: 'assets/3d-assets/Terrain_Outer.gltf',
  texturePath: ['assets/3d-assets/Textures/LowResAerial.jpg'],
};

const terrainExistingFilePath: FileCombination = {
  gltfPath: 'assets/3d-assets/Terrain_Existing.gltf',
  texturePath: ['assets/3d-assets/Textures/Existing.jpg'],
};

const terrainYear16FilePath: FileCombination = {
  gltfPath: 'assets/3d-assets/Terrain_Year16.gltf',
  texturePath: ['assets/3d-assets/Textures/Year 16.jpg'],
};

const miningFacilitiesFilePath: FileCombination = {
  gltfPath: 'assets/3d-assets/Mining_Facilities.gltf',
  texturePath: [
    'assets/3d-assets/Textures/130_metal-rufing-texture-seamless.jpg',
    'assets/3d-assets/Textures/130_metal-rufing-texture-seamless-green.jpg',
    'assets/3d-assets/Textures/185_metal-rufing-texture-seamless-2.jpg',
    'assets/3d-assets/Textures/Berms.jpg',
    'assets/3d-assets/Textures/ConcreteBare0428_4_seamless_L.jpg',
    'assets/3d-assets/Textures/MetalFloorsBare0037_5_S Grey.jpg',
    'assets/3d-assets/Textures/WoodFine0058_30_seamless_M.jpg',
    'assets/3d-assets/Textures/roads uv.jpg',
    'assets/3d-assets/Textures/Rom 02.jpg',
    'assets/3d-assets/Textures/Rom pad.jpg',
  ],
};

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public selectedStage: string;
  public preMiningStage = stage.Pre_mining;
  public miningStage = stage.Mining;

  @ViewChild('rendererCanvas', { static: false })
  public rendererCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(private threeService: ThreeService, private ngZone: NgZone) {
    this.selectedStage = stage.Pre_mining;
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
    return this.selectedStage === stage.Pre_mining
      ? [terrainOuterFilePath, terrainExistingFilePath]
      : [terrainYear16FilePath, miningFacilitiesFilePath];
  }

  private animateModels() {
    const paths = this.getFilePathsBySelectedStage();
    if (this.rendererCanvas) {
      this.threeService.createScene(this.rendererCanvas, paths);
      this.threeService.animate();
    }
  }
}
