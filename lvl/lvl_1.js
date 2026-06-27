import { LVL_1_Boss } from '../models/enemies/lvl-1-boss.class.js';
import { SkeletonWarriorLVL1 } from '../models/enemies/skeleton_warrior_1.class.js';
import { LVL } from '../models/lvl.class.js';
import { BackgroundObject } from '../models/objects/background-object.class.js';
import { EnvironmentObject } from '../models/objects/environment-objects.class.js';
import { PlatformObjects } from '../models/objects/platform-objects.class.js';
import { ThrowableObject } from '../models/objects/throwable-objects.class.js';

const backgroundObjects = [];

// add an extra background object at the beginning to ensure seamless scrolling
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



const platformObjects = [];

for (let index = 0; index < 100; index++) {
  const x = index * 50 - 200;

  platformObjects.push(
    new PlatformObjects('./assets/img/Platformer/Autumn_Forest_2D_Platformer_Tileset_Platformer - Ground 02.png', x, 400, 50, 50),
    new PlatformObjects('./assets/img/Platformer/Autumn_Forest_2D_Platformer_Tileset_Platformer - Ground 06.png', x, 450, 50, 50)
  );
}


const skeletonWarrior1Array = [];

skeletonWarrior1Array.push(new LVL_1_Boss());

for (let i = 0; i < 11; i++) {
  const skeletonWarrior = new SkeletonWarriorLVL1();
  skeletonWarrior.x = 500 + Math.random() * 3000;
  skeletonWarrior.y = 280;
  skeletonWarrior1Array.push(skeletonWarrior);
}

const rookObjects = [];

for (let i = 0; i < 10; i++) {
  const rookX = 650 + Math.random() * 2600;
  rookObjects.push(new ThrowableObject(rookX, 360));
}


const worldSettings = {
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
  ]
};

const bossMusicTriggerSignpost = new EnvironmentObject(
  'assets/img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - Signpost 04.png',
  3700,
  333,
  70,
  70
);

bossMusicTriggerSignpost.startsBossMusic = true;



export const lvl_1 = new LVL(
  skeletonWarrior1Array,
  platformObjects,
  [
    ...rookObjects,
    new EnvironmentObject('assets/img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - House.png', -150, 200, 250, 200),
    new EnvironmentObject('assets/img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - Fence 02.png', 80, 333, 70, 70),
    new EnvironmentObject('assets/img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - Fence 02.png', 140, 333, 70, 70),
    new EnvironmentObject('assets/img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - Fence 02.png', 200, 333, 70, 70),
    new EnvironmentObject('assets/img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - Fence 02.png', 260, 333, 70, 70),
    bossMusicTriggerSignpost,
    new EnvironmentObject('assets/img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - Fence 02.png', 380, 333, 70, 70),
    new EnvironmentObject('assets/img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - Fence 02.png', 440, 333, 70, 70),
    new EnvironmentObject('assets/img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - Signpost 01.png', 530, 333, 70, 70),
    new EnvironmentObject('assets/img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - Tree 02.png', 200, 55, 350, 350),
    new EnvironmentObject('assets/img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - Signpost 04.png', 3700, 333, 70, 70),
  ],
  backgroundObjects,
  worldSettings,
);