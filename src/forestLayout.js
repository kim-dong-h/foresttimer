// Art-directed ground mask for the fixed 1536 x 1024 forest painting.
// All dimensions are in scene coordinates, independent of viewport size.
export const GROUND_OUTLINE = [
  [285, 463], [1070, 463], [1180, 550], [1430, 615],
  [1536, 684], [1536, 1038], [0, 1038], [0, 696],
  [154, 632], [260, 552],
];
export const GROUND_OBSTACLES = [
  { x: 732, y: 493, rx: 73, ry: 38 },
  { x: 1180, y: 512, rx: 97, ry: 45 },
  { x: 74, y: 584, rx: 100, ry: 78 },
  { x: 1475, y: 624, rx: 87, ry: 58 },
  { x: 45, y: 937, rx: 132, ry: 91 },
];
const ROOT_OUTLINES = [
  [[0, 460], [270, 460], [290, 541], [386, 596], [535, 654], [350, 647], [176, 640], [0, 656]],
  [[1375, 457], [1536, 450], [1536, 646], [1360, 662], [1225, 642], [1320, 584]],
  [[1040, 456], [1143, 456], [1130, 502], [1072, 527], [1020, 548]],
];
const CLUSTERS = [
  [218, 652, 120, 74], [385, 551, 115, 48], [582, 518, 125, 46],
  [830, 494, 128, 43], [965, 566, 121, 57], [1090, 608, 112, 67],
  [1315, 664, 125, 73], [1450, 719, 107, 72], [84, 742, 105, 84],
  [267, 760, 130, 80], [470, 649, 120, 77], [637, 678, 122, 79],
  [805, 741, 142, 84], [1067, 750, 149, 84], [1250, 812, 134, 81],
  [1430, 860, 119, 82], [175, 902, 143, 99], [359, 940, 134, 83],
  [584, 934, 138, 91], [778, 894, 128, 90], [1000, 962, 150, 94],
  [1225, 985, 136, 90], [1433, 1010, 131, 84],
];

function inPolygon(x, y, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function forestDepth(y) {
  return Math.max(0, Math.min(1, (y - 463) / 565));
}

export function isPlantableGround(x, y, width = 0) {
  if (!inPolygon(x, y, GROUND_OUTLINE)) return false;
  if (ROOT_OUTLINES.some(polygon => inPolygon(x, y, polygon))) return false;
  if (GROUND_OBSTACLES.some(({ x: ox, y: oy, rx, ry }) =>
    ((x - ox) / (rx + width * 0.08)) ** 2 + ((y - oy) / (ry + width * 0.04)) ** 2 < 1)) return false;
  // Keep feet readable. Back-layer foliage can sit behind the spirit's body.
  if (((x - 480) / 84) ** 2 + ((y - 804) / 33) ** 2 < 1) return false;
  if (y > 808 && Math.abs(x - 480) < 175 && y - width * 1.1 < 768) return false;
  return true;
}

function clusterField(x, y) {
  let nearest = 0;
  let density = 0;
  let strength = -1;
  CLUSTERS.forEach(([cx, cy, rx, ry], index) => {
    const value = Math.exp(-1.7 * (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2));
    density += value;
    if (value > strength) { strength = value; nearest = index; }
  });
  return { cluster: nearest, density: Math.min(0.96, 0.12 + density * 0.65) };
}

export function plantingSeparation(a, b) {
  // Elliptical footprints model a foreshortened ground plane. Leaves may
  // overlap, but roots cannot pile up on a single spot. Larger plants need room.
  const combinedWidth = a.width + b.width;
  return ((a.x - b.x) / (combinedWidth * 0.18)) ** 2
    + ((a.y - b.y) / (combinedWidth * 0.075)) ** 2;
}

export function createForestLayout(count = 800) {
  let seed = 470023;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const slots = [];
  // Variable-footprint rejection sampling within a clustered density field.
  // A fixed seed keeps stored slot identities and layouts stable across reloads.
  for (let attempt = 0; slots.length < count && attempt < 180000; attempt += 1) {
    const x = Math.round(12 + random() * 1512);
    const y = Math.round(463 + random() * 565);
    const depth = forestDepth(y);
    const width = Math.round((34 + depth * 84) * (0.88 + random() * 0.24));
    if (!isPlantableGround(x, y, width)) continue;
    const { cluster, density } = clusterField(x, y);
    if (random() > density) continue;
    const slot = {
      x, y, width, cluster,
      depth,
      brightness: 0.90 + depth * 0.10,
      opacity: 0.84 + depth * 0.16,
    };
    if (slots.some(other => plantingSeparation(slot, other) < 1)) continue;
    slots.push(slot);
  }
  if (slots.length !== count) throw new Error(`Forest ground supports ${slots.length} of ${count} requested plants`);
  return slots;
}

export function pickGrowingSlot(available, plantedSlots, random) {
  const clampRandom = () => Math.max(0, Math.min(0.999999999, random()));
  const activeClusters = new Set(plantedSlots.map(slot => slot.cluster));
  // Mostly spread inside an established patch, occasionally start a new patch.
  const existingPatch = available.filter(slot => activeClusters.has(slot.cluster));
  const pool = existingPatch.length && clampRandom() < 0.72 ? existingPatch : available;
  const weights = pool.map(slot => 0.7 + slot.depth * 0.3);
  let draw = clampRandom() * weights.reduce((sum, weight) => sum + weight, 0);
  for (let index = 0; index < pool.length; index += 1) {
    draw -= weights[index];
    if (draw < 0) return pool[index];
  }
  return pool[pool.length - 1];
}
