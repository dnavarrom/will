let Application = PIXI.Application,
  Container = PIXI.Container,
  loader = PIXI.loader,
  resources = PIXI.loader.resources,
  TextureCache = PIXI.utils.TextureCache,
  Rectangle = PIXI.Rectangle;
//UiTextInfo = PIXI.Text;

let b = new Bump(PIXI);
let helper = new Helpers();

//Mobile device detection
//1 = normal / 2 : retina
let resolution = (isMobile.any == true &&
  (isMobile.apple.phone == true ||
    isMobile.apple.tablet == true ||
    isMobile.apple.device == true)) ? 2 : 1;

var app = new PIXI.Application({
  width: window.innerWidth, //config.app.width, //800,//1600,
  height: window.innerHeight, //config.app.height, //600,//900,
  antialias: true, // default: false
  transparent: false, // default: false
  resolution: resolution, // default: 1
  autoResize: true
  //backgroundColor : config.app.visual.bgcolor
});

//app.renderer.autoResize = true;
app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
//app.renderer.resize(window.innerWidth, window.innerHeight);

//Init Factory
CreatureFactory.register("Survivor", Survivor);
CreatureFactory.register("Predator", Predator);
SpriteFactory.register("FoodSprite", FoodSprite);
SpriteFactory.register("PredatorSprite", PredatorSprite);
SpriteFactory.register("SurvivorSprite", SurvivorSprite);

console.log("PARAMETERS");
console.log("==========");
console.log(app.screen.width);
console.log(app.screen.height);

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.renderer.view);

//States
let state;
let stateManager;

//Scenes
var tilingSprite; //movimiento del fondo de pantalla
var splashScreen; //container
var deviceRotationScreen; //container
var world;
var inGameInformation;

// global : create an array to store all the sprites
//var world.worldInfo.survivorsInfo = [];

//global : collect Status

var generationStats = [];
generationStats.push({ BestsurvivorId: -1, WorsesurvivorId: -1, BestFitness: -1, WorseFitness: -1 });

//bordes de los tipos de objetos
var foodBounds;

//game loop
var tick = 0;
var currentTick = 10;
var iteration = 0;
var GenerationLimit = config.evolution.generationLimit;

//animation-background
var switchDirection = 1; //to change background scrolling direction

var totalSurvivors = config.world.survivors;
var totalPredators = config.world.predators;
var totalFood = config.world.food;
//debug Mode
var debugModeOn = config.debugMode;

//LOAD FUNCION
loader
  //.add()
  .add("img/star.png")
  .add("img/predator.png")
  .add("img/trail.png")
  .add("img/background-9.jpeg")
  .add("img/icons/rotate-screen-48.png")
  .load(setup);

/************************
 * SETUP FUNCION
 */
function setup() {

  let texture = PIXI.loader.resources["img/background-9.jpeg"].texture;
  tilingSprite = new PIXI.extras.TilingSprite(
    texture,
    app.screen.width,
    app.screen.height
  );
  app.stage.addChild(tilingSprite);

  //Scene 0 : to rotate device (optional)
  deviceRotationScreen = new DeviceRotation(app);

  //Scene 1 : Splash
  splashScreen = new Splash(app);
  splashScreen.startText.on('click', onStartTextClick);
  splashScreen.startText.on('tap', onStartTextClick);

  //Scene 2 : Main Simulation
  world = new World(app, b);

  //Scene 3: UI information
  inGameInformation = new InGameInformation(app);

  //Collect Scenes:
  let opt = {
    scenes: {
      world: world,
      splash: splashScreen,
      rotation: deviceRotationScreen,
      inGameInformation : inGameInformation
    }
  }

  stateManager = new StateManager(opt);

  //Detect device orientation (mobile only)
  if (isMobile.any && window.orientation != 90) {
    state = deviceRotation;
  } else {
    state = splash; //run function
  }


  app.ticker.add(delta => gameLoop(delta));

}

/**
 * Start
 */
function initWorld() {

  world.init();

  state = run;

}

/************************
 * 
 * Run simulation
 */
function run(delta) {

  stateManager.setState(Constants.simulationStates.RUN);

  // iterate through the survivors and find food, move, dodge, reproduce
  world.processSurvivor();
  // iterate through the eaters and find survivors to eat
  world.processPredator();

  /* Process food */
  world.processFood();

  if (tick > currentTick) {
    iteration++;
    world.checkSimulationStatus(delta);
    currentTick = currentTick + 10;

    if (iteration > GenerationLimit) {
      evaluateGeneration();
      iteration = 0;

      //Regenerate Food
      world.loadFood(helper.generateRandomInteger(0, config.world.maxFoodGenerationRatio));

    }

    //TODO : cambiar esto, lo estoy usando para cambiar la direccion del background image, 
    //un poco fucker. Si las iteraciones son multiplos de 200, cambio la direccion del fondo
    //de pantalla. ([x,y]+desplazamiento)*switchDirection. Esto no funciona cuando quiera
    //cambiar el fondo de pantalla por otro de diferente tamaño
    if (currentTick % 500 === 0) {
      switchDirection *= -1;
    }
  }

  //Show Lineage (chilrens)
  showLineage();

  //Update UI
  let generationNumber = generationStats.length;

  inGameInformation.updateUi(world.survivorsInfo.length, world.predatorsInfo.length, world.foodInfo.length,
    iteration, generationNumber,
    generationStats[
      generationNumber - 1], app.ticker.FPS);

  //Update debug information
  world.updateDebugInfo();

  //move background
  tilingSprite.tilePosition.x -= 0.1 * switchDirection;
  tilingSprite.tilePosition.y -= 0.1 * switchDirection;

}

/**
 * 
 * Main Loop
 */
function gameLoop(delta) {

  state(delta);

  // increment the ticker
  tick += 0.1;

}

/**
 * Calculate fitness and evaluate generation
 */
function evaluateGeneration() {

  var BestsurvivorId = 0;
  var WorsesurvivorId = 0;
  var BestFitness = 0;
  var WorseFitness = 0;
  var TotalEated = 0;
  var TotalDeaths = 0;

  var survivorsOrderedInfo = [];

  //ordenado de menor a mayor
  survivorsOrderedInfo = _.sortBy(_.union(world.survivorsInfo, world.deadSurvivors), 'numBugEated');

  let lastIdx = survivorsOrderedInfo.length;

  var thisGen = {
    BestsurvivorId: 0,
    WorsesurvivorId: 0,
    BestFitness: 0,
    WorseFitness: 0
  };

  if (lastIdx > 0) {
    thisGen = {
      BestsurvivorId: survivorsOrderedInfo[lastIdx - 1].collectStats()
        .uid,
      WorsesurvivorId: survivorsOrderedInfo[0].collectStats()
        .uid,
      BestFitness: survivorsOrderedInfo[lastIdx - 1].collectStats()
        .numBugEated,
      WorseFitness: survivorsOrderedInfo[0].collectStats()
        .numBugEated
    };
  }

  //console.dir(survivorsOrderedInfo);
  generationStats.push(thisGen);

}


function showLineage() {
  for (let i = 0; i < world.survivorsInfo.length; i++) {
    for (let j = 0; j < world.survivorsInfo[i].childrens.length; j++) {
      let childrenObj = world.survivorsInfo.find(o => o.uid == world.survivorsInfo[i].childrens[j]);
      if (childrenObj)
        updateChildrenTreeLine(world.survivorsInfo[i].sprite, childrenObj.sprite);
    }
  }
}

function deviceRotation(delta) {
  stateManager.setState(Constants.simulationStates.ROTATION);
  moveBackground();
}

function splash(delta) {
  stateManager.setState(Constants.simulationStates.SPLASH);
  moveBackground();
}

function moveBackground() {
  tilingSprite.tilePosition.x -= 0.1 * switchDirection;
  tilingSprite.tilePosition.y -= 0.1 * switchDirection;
}

function updateChildrenTreeLine(survivor, targetSurvivor) {
  //Circle
  let currentLine = world.targetMateLineInfo.find(o => o.uid == survivor.uid);
  if (currentLine) {
    currentLine.clear();
    //currentLine.position.set(survivor.x, survivor.y);
    currentLine.lineStyle(1, Constants.colors.BLUE, 1)
      .moveTo(survivor.x, survivor.y)
      .lineTo(targetSurvivor.x, targetSurvivor.y);
    currentLine.beginFill(0.2);
    currentLine.endFill();
  }
}

function onKeyDown(key) {

  if (key.keyCode === 32) {
    debugModeOn = !debugModeOn;
  }

  if (key.keyCode === 13) {
    if (stateManager.getCurrentState() != Constants.simulationStates.RUN)
      state = initWorld;
  }
}

function onStartTextClick() {
  if (stateManager.getCurrentState() != Constants.simulationStates.RUN)
    state = initWorld;
}

function resizeMe() {
  app.renderer.resize(window.innerWidth, window.innerHeight);
  tilingSprite.width = window.innerWidth;
  tilingSprite.height = window.innerHeight;
  splashScreen.setPosition(window.innerWidth, window.innerHeight);
  deviceRotationScreen.setPosition(window.innerWidth, window.innerHeight);
  if (inGameInformation)
    inGameInformation.setPosition(window.innerWidth, window.innerHeight);
}

function readDeviceOrientation() {

  switch (stateManager.getCurrentState()) {
    case Constants.simulationStates.ROTATION:
      if (Math.abs(window.orientation) === 90) {
        if (stateManager.getLastState() == Constants.simulationStates.RUN)
          state = run;
        else
          state = splash;
      } else {
        state = deviceRotation;
      }
      break;

    case Constants.simulationStates.STOPPED:
      if (Math.abs(window.orientation) === 90) {
        state = splash;
      } else {
        state = deviceRotation;
      }
      break;

    case Constants.simulationStates.RUN:
      if (Math.abs(window.orientation) === 90) {
        state = run;
      } else {
        state = deviceRotation;
      }
      break;

    case Constants.simulationStates.SPLASH:
      if (Math.abs(window.orientation) === 90) {
        state = splash;
      } else {
        state = deviceRotation;
      }
      break;

  }

}

document.addEventListener('keydown', onKeyDown);
window.addEventListener("resize", resizeMe);
window.onorientationchange = readDeviceOrientation;
