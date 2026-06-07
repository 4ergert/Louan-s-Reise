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



const lvl_1 = new LVL(
  [
    new SkeletonWarriorLVL1(),
    new SkeletonWarriorLVL1(),
    new SkeletonWarriorLVL1()
  ],
  [
    new PlatformObjects('img/Platformer/Autumn_Forest_2D_Platformer_Tileset_Platformer - Ground 02.png', -100, 400, 100, 100),
    new PlatformObjects('img/Platformer/Autumn_Forest_2D_Platformer_Tileset_Platformer - Ground 02.png', 0, 400, 100, 100),
    new PlatformObjects('img/Platformer/Autumn_Forest_2D_Platformer_Tileset_Platformer - Ground 02.png', 100, 400, 100, 100),
    new PlatformObjects('img/Platformer/Autumn_Forest_2D_Platformer_Tileset_Platformer - Ground 02.png', 200, 400, 100, 100)
  ],
  [
    new EnvironmentObject('img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - House.png', -150, 200, 250, 200),
  ],
  backgroundObjects,
);