import { LVL_1_Boss } from '../models/enemies/lvl-1-boss.class.js';
import { SkeletonWarrior1 } from '../models/enemies/skeleton_warrior_1.class.js';
import { LVL } from './lvl.class.js';
import { Coins } from '../models/objects/coin-object.class.js';
import { BackgroundObject } from '../models/objects/background-object.class.js';
import { EnvironmentObject } from '../models/objects/environment-objects.class.js';
import { PlatformObjects } from '../models/objects/platform-objects.class.js';
import { ThrowableObject } from '../models/objects/throwable-objects.class.js';

const backgroundObjects = [];

// add an extra background object at the beginning to ensure seamless scrolling
backgroundObjects.push(
  new BackgroundObject('./assets/img/lvl-2/Background/Crystal_Caves_Forest_2D_Platformer_Tileset_Background - Layer 00.png', 0.25, -720)
);

// Add multiple background objects to create a seamless scrolling effect for the parallax layers
for (let index = 0; index < 3; index++) {
  const x = index * 720;

  backgroundObjects.push(
    new BackgroundObject('./assets/img/lvl-2/Background/Crystal_Caves_Forest_2D_Platformer_Tileset_Background - Layer 00.png', 0.25, x)
  );
}

// Add multiple background objects for the second parallax layer 
for (let index = 0; index < 5; index++) {
  const x = index * 720;

  backgroundObjects.push(
    new BackgroundObject('./assets/img/lvl-2/Background/Crystal_Caves_Forest_2D_Platformer_Tileset_Background - Layer 01.png', 0.55, x)
  );
}

const platformObjects = [];

for (let index = 0; index < 70; index++) {
  const x = index * 50 - 200;

  platformObjects.push(
    new PlatformObjects('./assets/img/lvl-2/Platfromer/Crystal_Caves_Forest_2D_Platformer_Tileset_Platformer - Ground 02.png', x, 400, 50, 50),
    new PlatformObjects('./assets/img/lvl-2/Platfromer/Crystal_Caves_Forest_2D_Platformer_Tileset_Platformer - Ground 06.png', x, 450, 50, 50)
  );
}

platformObjects.push(
  new PlatformObjects('./assets/img/lvl-2/Platfromer/Crystal_Caves_Forest_2D_Platformer_Tileset_Platformer - Ground 04.png', -250, 400, 50, 50),
  new PlatformObjects('./assets/img/lvl-2/Platfromer/Crystal_Caves_Forest_2D_Platformer_Tileset_Platformer - Ground 09.png', -250, 450, 50, 50)
);

platformObjects.push(
  new PlatformObjects('./assets/img/lvl-2/Platfromer/Crystal_Caves_Forest_2D_Platformer_Tileset_Platformer - Ground 10.png', 700, 290, 50, 50),
  new PlatformObjects('./assets/img/lvl-2/Platfromer/Crystal_Caves_Forest_2D_Platformer_Tileset_Platformer - Ground 11.png', 750, 290, 50, 50),
  new PlatformObjects('./assets/img/lvl-2/Platfromer/Crystal_Caves_Forest_2D_Platformer_Tileset_Platformer - Ground 12.png', 800, 290, 50, 50),
  new PlatformObjects('./assets/img/lvl-2/Platfromer/Crystal_Caves_Forest_2D_Platformer_Tileset_Platformer - Bridge Part 01.png', 1300, 250, 50, 50),
  new PlatformObjects('./assets/img/lvl-2/Platfromer/Crystal_Caves_Forest_2D_Platformer_Tileset_Platformer - Bridge Part 02.png', 1350, 250, 50, 50),
  new PlatformObjects('./assets/img/lvl-2/Platfromer/Crystal_Caves_Forest_2D_Platformer_Tileset_Platformer - Bridge Part 01.png', 1400, 250, 50, 50),
  new PlatformObjects('./assets/img/lvl-2/Platfromer/Crystal_Caves_Forest_2D_Platformer_Tileset_Platformer - Ground Additional 02.png', 1850, 200, 50, 50),
  new PlatformObjects('./assets/img/lvl-2/Platfromer/Crystal_Caves_Forest_2D_Platformer_Tileset_Platformer - Ground Additional 03.png', 1900, 200, 50, 50),
  new PlatformObjects('./assets/img/lvl-2/Platfromer/Crystal_Caves_Forest_2D_Platformer_Tileset_Platformer - Ground Additional 04.png', 1950, 200, 50, 50)
);

const enemies = [
  new SkeletonWarrior1(980, 280),
  new SkeletonWarrior1(1680, 280),
  new SkeletonWarrior1(2350, 280),
];

const coins = [
  new Coins(730, 245),
  new Coins(780, 245),
  new Coins(1330, 205),
  new Coins(1380, 205),
  new Coins(1880, 155),
  new Coins(1930, 155),
];

const throwableObjects = [
  new ThrowableObject(1120, 336),
  new ThrowableObject(2140, 336),
];

const solidObjects = [
  new EnvironmentObject('./assets/img/lvl-2/Platfromer/Crystal_Caves_Forest_2D_Platformer_Tileset_Platformer - Wooden Box.png', 1180, 310, 50, 50),
  new EnvironmentObject('./assets/img/lvl-2/Platfromer/Crystal_Caves_Forest_2D_Platformer_Tileset_Platformer - Wooden Box.png', 1180, 354, 50, 50),
  new EnvironmentObject('./assets/img/lvl-2/Platfromer/Crystal_Caves_Forest_2D_Platformer_Tileset_Platformer - Stone.png', 2020, 315, 45, 45),
];

const environmentObjects = [
  ...solidObjects,
  ...coins,
  ...throwableObjects,
  new EnvironmentObject('./assets/img/lvl-2/Environment/Crystal_Caves_Forest_2D_Platformer_Tileset_Environment - Signpost 02.png', 180, 333, 70, 70),
  new EnvironmentObject('./assets/img/lvl-2/Environment/Crystal_Caves_Forest_2D_Platformer_Tileset_Environment - Crystal 01.png', 420, 290, 90, 90),
  new EnvironmentObject('./assets/img/lvl-2/Environment/Crystal_Caves_Forest_2D_Platformer_Tileset_Environment - Crystal pile 01.png', 860, 300, 110, 110),
  new EnvironmentObject('./assets/img/lvl-2/Environment/Crystal_Caves_Forest_2D_Platformer_Tileset_Environment - Rock 03.png', 1520, 318, 70, 70),
  new EnvironmentObject('./assets/img/lvl-2/Environment/Crystal_Caves_Forest_2D_Platformer_Tileset_Environment - Rune stone.png', 2160, 280, 120, 120),
  new EnvironmentObject('./assets/img/lvl-2/Environment/Crystal_Caves_Forest_2D_Platformer_Tileset_Environment - Pillar.png', 2620, 180, 160, 220),
  new EnvironmentObject('./assets/img/lvl-2/Environment/Crystal_Caves_Forest_2D_Platformer_Tileset_Environment - Fire.png', 2660, 332, 48, 68),
  new EnvironmentObject('./assets/img/lvl-2/Environment/Crystal_Caves_Forest_2D_Platformer_Tileset_Environment - Signpost 04.png', 3050, 333, 70, 70),
];

const worldSettings = {
  openingIntroLines: [],
  bossIntroLines: [],
  aliaIntroLines: [],
  characterResponseIntroLines: [],
};

export const lvl_2 = new LVL(
  enemies,
  platformObjects,
  solidObjects,
  environmentObjects,
  backgroundObjects,
  worldSettings,
);