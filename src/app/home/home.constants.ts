import { FileCombination } from '../type/3d-model';

export enum stage {
  Pre_mining = 'pre-mining',
  Mining = 'mining',
}

export const terrainOuterFilePath: FileCombination = {
  gltfPath: 'assets/3d-assets/Terrain_Outer.gltf',
  texturePath: ['assets/3d-assets/Textures/LowResAerial.jpg'],
};

export const terrainExistingFilePath: FileCombination = {
  gltfPath: 'assets/3d-assets/Terrain_Existing.gltf',
  texturePath: ['assets/3d-assets/Textures/Existing.jpg'],
};

export const terrainYear16FilePath: FileCombination = {
  gltfPath: 'assets/3d-assets/Terrain_Year16.gltf',
  texturePath: ['assets/3d-assets/Textures/Year 16.jpg'],
};

export const miningFacilitiesFilePath: FileCombination = {
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
