import { LVL_1_Boss } from '../models/enemies/lvl-1-boss.class.js';
import { SkeletonWarrior1 } from '../models/enemies/skeleton_warrior_1.class.js';
import { SkeletonWarrior2 } from '../models/enemies/skeleton_warrior_2.class.js';
import { LVL } from './lvl.class.js';
import { Coins } from '../models/objects/coin-object.class.js';
import { BackgroundObject } from '../models/objects/background-object.class.js';
import { EnvironmentObject } from '../models/objects/environment-objects.class.js';
import { PlatformObjects } from '../models/objects/platform-objects.class.js';
import { ThrowableObject } from '../models/objects/throwable-objects.class.js';

/** @typedef {SkeletonWarrior1 | SkeletonWarrior2 | LVL_1_Boss} LevelEnemy */

/**
 * @typedef {object} LevelWorldSettings
 * @property {number} bossArenaStartX - World x-position where the boss arena starts.
 * @property {number} fallDeathStartX - World x-position after which falling becomes lethal.
 * @property {string[]} openingIntroLines - Intro dialog shown at the start of the level.
 * @property {string[]} bossIntroLines - Dialog shown when the boss encounter starts.
 * @property {string[]} aliaIntroLines - Dialog shown after rescuing Alia.
 * @property {string[]} characterResponseIntroLines - Player response shown after the Alia intro.
 */

/** @type {BackgroundObject[]} */
const backgroundObjects = [];


// Add an extra background object at the beginning to ensure seamless scrolling
backgroundObjects.push(
  new BackgroundObject('assets/img/Background/Autumn_Forest_2D_Platformer_Tileset_Background - Layer 00.png', 0.25, -720)
);

// Add multiple background objects to create a seamless scrolling effect for the parallax layers
for (let index = 0; index < 3; index++) {
  const x = index * 720;

  backgroundObjects.push(
    new BackgroundObject('assets/img/Background/Autumn_Forest_2D_Platformer_Tileset_Background - Layer 00.png', 0.25, x)
  );
}

// Add multiple background objects for the second parallax layer
for (let index = 0; index < 5; index++) {
  const x = index * 720;

  backgroundObjects.push(
    new BackgroundObject('assets/img/Background/Autumn_Forest_2D_Platformer_Tileset_Background - Layer 01.png', 0.55, x)
  );
}



/** @type {PlatformObjects[]} */
const platformObjects = [];

// Add platform objects for the main level area
for (let index = 0; index < 72; index++) {
  const x = index * 50 - 300;

  platformObjects.push(
    new PlatformObjects('./assets/img/Platformer/Autumn_Forest_2D_Platformer_Tileset_Platformer - Ground 02.png', x, 400, 50, 50),
    new PlatformObjects('./assets/img/Platformer/Autumn_Forest_2D_Platformer_Tileset_Platformer - Ground 06.png', x, 450, 50, 50)
  );
}

// Add additional platform objects for specific areas in the level
for (let index = 0; index < 40; index++) {
  const x = index * 50 + 3550;

  platformObjects.push(
    new PlatformObjects('./assets/img/Platformer/Autumn_Forest_2D_Platformer_Tileset_Platformer - Ground 02.png', x, 400, 50, 50),
    new PlatformObjects('./assets/img/Platformer/Autumn_Forest_2D_Platformer_Tileset_Platformer - Ground 06.png', x, 450, 50, 50)
  );
}

// Add additional platform objects for the boss arena area
platformObjects.push(
  new PlatformObjects('./assets/img/Platformer/Autumn_Forest_2D_Platformer_Tileset_Platformer - Ground 04.png', -350, 400, 50, 50),
  new PlatformObjects('./assets/img/Platformer/Autumn_Forest_2D_Platformer_Tileset_Platformer - Ground 09.png', -350, 450, 50, 50),

  new PlatformObjects('./assets/img/Platformer/Autumn_Forest_2D_Platformer_Tileset_Platformer - Ground 08.png', 3300, 400, 50, 50),
  new PlatformObjects('./assets/img/Platformer/Autumn_Forest_2D_Platformer_Tileset_Platformer - Ground 13.png', 3300, 450, 50, 50),

  new PlatformObjects('./assets/img/Platformer/Autumn_Forest_2D_Platformer_Tileset_Platformer - Ground 04.png', 3500, 400, 50, 50),
  new PlatformObjects('./assets/img/Platformer/Autumn_Forest_2D_Platformer_Tileset_Platformer - Ground 09.png', 3500, 450, 50, 50),

  new PlatformObjects('./assets/img/Platformer/Autumn_Forest_2D_Platformer_Tileset_Platformer - Ground 10.png', 2000, 220, 50, 50),
  new PlatformObjects('./assets/img/Platformer/Autumn_Forest_2D_Platformer_Tileset_Platformer - Ground 11.png', 2050, 220, 50, 50),
  new PlatformObjects('./assets/img/Platformer/Autumn_Forest_2D_Platformer_Tileset_Platformer - Ground 11.png', 2100, 220, 50, 50),
  new PlatformObjects('./assets/img/Platformer/Autumn_Forest_2D_Platformer_Tileset_Platformer - Ground 11.png', 2150, 220, 50, 50),
  new PlatformObjects('./assets/img/Platformer/Autumn_Forest_2D_Platformer_Tileset_Platformer - Ground 11.png', 2200, 220, 50, 50),
  new PlatformObjects('./assets/img/Platformer/Autumn_Forest_2D_Platformer_Tileset_Platformer - Ground 11.png', 2250, 220, 50, 50),
  new PlatformObjects('./assets/img/Platformer/Autumn_Forest_2D_Platformer_Tileset_Platformer - Ground 11.png', 2300, 220, 50, 50),
  new PlatformObjects('./assets/img/Platformer/Autumn_Forest_2D_Platformer_Tileset_Platformer - Ground 11.png', 2350, 220, 50, 50),
  new PlatformObjects('./assets/img/Platformer/Autumn_Forest_2D_Platformer_Tileset_Platformer - Ground 11.png', 2400, 220, 50, 50),
  new PlatformObjects('./assets/img/Platformer/Autumn_Forest_2D_Platformer_Tileset_Platformer - Ground 11.png', 2450, 220, 50, 50),
  new PlatformObjects('./assets/img/Platformer/Autumn_Forest_2D_Platformer_Tileset_Platformer - Ground 12.png', 2500, 220, 50, 50),
);


/** @type {LevelEnemy[]} */
const enemiesArray = [];

// Add enemies to the level
enemiesArray.push(new SkeletonWarrior1(1000, 280));
enemiesArray.push(new SkeletonWarrior1(1500, 280));
enemiesArray.push(new SkeletonWarrior2(2300, 100));
enemiesArray.push(new SkeletonWarrior1(2150, 280));
enemiesArray.push(new SkeletonWarrior2(3000, 280));
enemiesArray.push(new LVL_1_Boss());


/** @type {ThrowableObject[]} */
const throwableObjects = [];

/** @type {Coins[]} */
const coins = [
  new Coins(800, 350),
  new Coins(2200, 175),
  new Coins(2150, 175),
  new Coins(2200, 175),
  new Coins(2250, 175),
  new Coins(2300, 175),
  new Coins(2350, 175),
  new Coins(2400, 175),
  new Coins(2450, 175),
];

/** @type {EnvironmentObject & { startsBossMusic: boolean }} */
const bossMusicTriggerSignpost = new EnvironmentObject(
  'assets/img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - Signpost 04.png',
  3550,
  333,
  70,
  70
);

bossMusicTriggerSignpost.startsBossMusic = true;

/** @type {EnvironmentObject[]} */
const solidObjects = [
  new EnvironmentObject('./assets/img/Platformer/Autumn_Forest_2D_Platformer_Tileset_Platformer - Wooden Box.png', 2400, 310, 50, 50),
  new EnvironmentObject('./assets/img/Platformer/Autumn_Forest_2D_Platformer_Tileset_Platformer - Wooden Box.png', 2400, 354, 50, 50),
  new EnvironmentObject('./assets/img/Platformer/Autumn_Forest_2D_Platformer_Tileset_Platformer - Wooden Box.png', 2350, 354, 50, 50),
  new EnvironmentObject('./assets/img/Platformer/Autumn_Forest_2D_Platformer_Tileset_Platformer - Wooden Box.png', 2450, 354, 50, 50),
];

/**
 * @type {EnvironmentObject & {
 *   unlockImagePath: string,
 *   ignoreCollisionFromBelow: boolean,
 *   rewardOffsetX: number,
 *   rewardOffsetY: number
 * }}
 */
const treasureChest = new EnvironmentObject(
  './assets/img/Collectable Object/Autumn_Forest_2D_Platformer_Tileset_Collectable Object - Locked Golden Treasure Box.png',
  2050,
  150,
  80,
  80
);

// Set additional properties for the treasure chest
treasureChest.unlockImagePath = './assets/img/Collectable Object/Autumn_Forest_2D_Platformer_Tileset_Collectable Object - Unlocked Golden Treasure Box.png';
treasureChest.ignoreCollisionFromBelow = true;
treasureChest.rewardOffsetX = 8;
treasureChest.rewardOffsetY = 18;

/** @type {EnvironmentObject[]} */
const collectableObjects = [treasureChest]

/** @type {EnvironmentObject[]} */
const blockingObjects = [
  ...solidObjects,
  ...collectableObjects,
];

/** @type {LevelWorldSettings} */
const worldSettings = {
  bossArenaStartX: 3500,
  fallDeathStartX: 3300,
  openingIntroLines: [
    'Irgendwas stimmt hier nicht!',
    'Meine Geschwister Alia und Liam',
    'sind verschwunden.',
    'Ich sollte sie suchen gehen.'
  ],
  bossIntroLines: [
    'Arrrrr, ich bin Aliam,',
    'der Skelett-König,',
    'arrrrr!'
  ],
  aliaIntroLines: [
    'Danke, Bruder Louan.',
    'Du hast mich gerettet.',
    'Jetzt müssen wir nur noch',
    'unseren Bruder Liam finden.'
  ],
  characterResponseIntroLines: [
    'Du hast vollkommen recht!',
    'Folge mir, Schwesterherz.'
  ]
};

/** @type {(EnvironmentObject | Coins | ThrowableObject)[]} */
const environmentObjects = [
  ...blockingObjects,
  ...coins,
  ...throwableObjects,
  new EnvironmentObject('assets/img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - Signpost 04.png', -300, 333, 70, 70),
  new EnvironmentObject('./assets/img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - House.png', -150, 200, 250, 200),
  new EnvironmentObject('./assets/img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - Fence 02.png', 80, 333, 70, 70),
  new EnvironmentObject('./assets/img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - Fence 02.png', 140, 333, 70, 70),
  new EnvironmentObject('./assets/img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - Fence 02.png', 200, 333, 70, 70),
  new EnvironmentObject('./assets/img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - Fence 02.png', 260, 333, 70, 70),
  bossMusicTriggerSignpost,
  new EnvironmentObject('./assets/img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - Fence 02.png', 380, 333, 70, 70),
  new EnvironmentObject('./assets/img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - Fence 02.png', 440, 333, 70, 70),
  new EnvironmentObject('./assets/img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - Signpost 01.png', 530, 333, 70, 70),
  new EnvironmentObject('./assets/img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - Tree 02.png', 200, 55, 350, 350),
  new EnvironmentObject('./assets/img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - Tree 01.png', 1100, 55, 350, 350),
  new EnvironmentObject('./assets/img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - Bush 01.png', 900, 304, 100, 100),
  new EnvironmentObject('./assets/img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - Bush 01.png', 1800, 304, 100, 100),
  new EnvironmentObject('./assets/img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - Tree 02.png', 2700, 55, 350, 350),
  new EnvironmentObject('./assets/img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - Stone 01.png', 3140, 283, 120, 120),
];

/** @type {LVL} */
export const lvl_1 = new LVL(
  enemiesArray,
  platformObjects,
  blockingObjects,
  environmentObjects,
  backgroundObjects,
  worldSettings,
);