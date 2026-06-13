const backgroundObjects = [];

// add an extra background object at the beginning to ensure seamless scrolling
backgroundObjects.push(
  new BackgroundObject('img/Background/Autumn_Forest_2D_Platformer_Tileset_Background - Layer 00.png', 0.25, -720)
);

// Add multiple background objects to create a seamless scrolling effect for the parallax layers
for (let index = 0; index < 3; index++) {
  const x = index * 720;

  backgroundObjects.push(
    new BackgroundObject('img/Background/Autumn_Forest_2D_Platformer_Tileset_Background - Layer 00.png', 0.25, x)
  );
}

// Add multiple background objects for the second parallax layer 
for (let index = 0; index < 5; index++) {
  const x = index * 720;

  backgroundObjects.push(
    new BackgroundObject('img/Background/Autumn_Forest_2D_Platformer_Tileset_Background - Layer 01.png', 0.55, x)
  );
}



const platformObjects = [];

for (let index = 0; index < 100; index++) {
  const x = index * 50 - 200;

  platformObjects.push(
    new PlatformObjects('./img/Platformer/Autumn_Forest_2D_Platformer_Tileset_Platformer - Ground 02.png', x, 400, 50, 50),
    new PlatformObjects('./img/Platformer/Autumn_Forest_2D_Platformer_Tileset_Platformer - Ground 06.png', x, 450, 50, 50)
  );
}


const skeletonWarrior1Array = [];

for (let i = 0; i < 33; i++) {
  const skeletonWarrior = new SkeletonWarriorLVL1();
  skeletonWarrior.x = 700 + Math.random() * 3000;
  skeletonWarrior1Array.push(skeletonWarrior);
}



const lvl_1 = new LVL(
  skeletonWarrior1Array,
  platformObjects,
  [
    new EnvironmentObject('img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - House.png', -150, 200, 250, 200),
    new EnvironmentObject('img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - Fence 02.png', 80, 333, 70, 70),
    new EnvironmentObject('img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - Fence 02.png', 140, 333, 70, 70),
    new EnvironmentObject('img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - Fence 02.png', 200, 333, 70, 70),
    new EnvironmentObject('img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - Fence 02.png', 260, 333, 70, 70),
    new EnvironmentObject('img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - Fence 02.png', 320, 333, 70, 70),
    new EnvironmentObject('img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - Fence 02.png', 380, 333, 70, 70),
    new EnvironmentObject('img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - Fence 02.png', 440, 333, 70, 70),
    new EnvironmentObject('img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - Signpost 01.png', 530, 333, 70, 70),
    new EnvironmentObject('img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - Tree 02.png', 200, 55, 350, 350),
    new Coins(),
  ],
  backgroundObjects,
);