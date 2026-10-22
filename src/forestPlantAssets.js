import grass from './assets/optimized/grass.webp';
import grassGeometry from './assets/woodland-plants/soft-pixel-v2/grass.json';
import fern from './assets/optimized/fern.webp';
import fernGeometry from './assets/woodland-plants/soft-pixel-v2/fern.json';
import shrub from './assets/optimized/shrub.webp';
import shrubGeometry from './assets/woodland-plants/soft-pixel-v2/shrub.json';
import flower from './assets/optimized/wildflower-clump.webp';
import flowerGeometry from './assets/woodland-plants/wildflower-clump.json';
import sapling from './assets/optimized/young-sapling.webp';
import saplingGeometry from './assets/woodland-plants/young-sapling.json';

export const forestPlantAssets = {
  'grass-tuft': { image: grass, geometry: grassGeometry },
  'woodland-fern': { image: fern, geometry: fernGeometry },
  'round-shrub': { image: shrub, geometry: shrubGeometry },
  'wildflower-clump': { image: flower, geometry: flowerGeometry },
  'young-sapling': { image: sapling, geometry: saplingGeometry },
};
