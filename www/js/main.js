let Application = PIXI.Application,
  Container = PIXI.Container,
  loader = PIXI.loader,
  resources = PIXI.loader.resources,
  TextureCache = PIXI.utils.TextureCache,
  Rectangle = PIXI.Rectangle;
UiTextInfo = PIXI.Text;

let state;
let b = new Bump(PIXI);

let helper = new Helpers();

var app = new PIXI.Application({
  width: config.app.width, //800,//1600,
  height: config.app.height, //600,//900,
  antialias: true, // default: false
  transparent: false, // default: false
  resolution: 1 // default: 1
  //backgroundColor : config.app.visual.bgcolor
});

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
document.body.appendChild(app.view);

//global
var survivorsContainer; //survivors Container
var predatorsContainer; //eaters Contariner
var foodContainer;
var uiTextInfo; //Entregar status
var debugContainer;
var tilingSprite; //movimiento del fondo de pantalla

// global : create an array to store all the sprites
var survivorsInfo = [];
var predatorsInfo = [];
var foodInfo = [];
var childInfo = [];
var debugInfo = [];

//global : collect Status
var deadSurvivors = [];
var generationStats = [];
generationStats.push({ BestsurvivorId: -1, WorsesurvivorId: -1, BestFitness: -1, WorseFitness: -1 });

//bordes de los tipos de objetos
var foodBounds;

//total Sprites
//var totalSurvivors = app.renderer instanceof PIXI.WebGLRenderer ? 10000 : 100;
var totalSurvivors = config.world.survivors;
var totalPredators = config.world.predators;
var totalFood = config.world.food;

//game loop
var tick = 0;
var currentTick = 10;
var iteration = 0;
var GenerationLimit = config.evolution.generationLimit;

//animation-background
var switchDirection = 1; //to change background scrolling direction

//debug mode
var debugModeOn = false;

//LOAD FUNCION
loader
  //.add()
  .load(setup);

/************************
 * SETUP FUNCION
 */
function setup() {

  let texture = PIXI.Texture.fromImage('img/background-9.jpeg');
  tilingSprite = new PIXI.extras.TilingSprite(
    texture,
    app.screen.width,
    app.screen.height
  );
  app.stage.addChild(tilingSprite);

  survivorsContainer = new PIXI.particles.ParticleContainer(10000, {
    scale: true,
    position: true,
    rotation: true,
    uvs: true,
    alpha: true
  });

  app.stage.addChild(survivorsContainer);

  predatorsContainer = new PIXI.particles.ParticleContainer(100, {
    scale: true,
    position: true,
    rotation: true,
    uvs: true,
    alpha: true
  });

  app.stage.addChild(predatorsContainer);

  foodContainer = new PIXI.particles.ParticleContainer(1000, {
    scale: true,
    position: true,
    rotation: true,
    uvs: true,
    alpha: true
  });
  app.stage.addChild(foodContainer);

  debugContainer = new PIXI.particles.ParticleContainer(1000, {
    scale: true,
    position: true,
    rotation: true,
    uvs: true,
    alpha: true
  })

  app.stage.addChild(debugContainer);

  //Init actors
  InitPredators(totalPredators);
  InitSurvivors(totalSurvivors);
  LoadFood(totalFood);

  //Show stats
  LoadUiInformation();

  app.stage.addChild(uiTextInfo);

  state = run; //run function

  app.ticker.add(delta => gameLoop(delta));

}

/************************
 * 
 * Run simulation
 */
function run(delta) {

  // iterate through the survivors and find food, move, dodge, reproduce
  processSurvivor();
  // iterate through the eaters and find survivors to eat
  processPredator();

  /* Process food */
  processFood();

}

/**
 * 
 * Main Loop
 */
function gameLoop(delta) {

  state(delta);

  //background movement
  tilingSprite.tilePosition.x -= 0.1 * switchDirection;
  tilingSprite.tilePosition.y -= 0.1 * switchDirection;

  if (tick > currentTick) {
    iteration++;
    checkSimulationStatus(delta);
    currentTick = currentTick + 10;

    if (iteration > GenerationLimit) {
      evaluateGeneration();
      iteration = 0;
      //TODO : cambiar esto, lo estoy usando para retroceder el background, un poco fucker.
      if (iteration % 50 === 0) {
        switchDirection *= -1;
      }

    }
  }

  //Update UI
  let generationNumber = generationStats.length;
  UpdateUI(survivorsInfo.length, predatorsInfo.length, foodInfo.length, iteration, generationNumber, generationStats[
    generationNumber - 1]);
  UpdateDebugInfo();

  //Clean arrays
  cleanUpLoop();

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
  survivorsOrderedInfo = _.sortBy(_.union(survivorsInfo, deadSurvivors), 'numBugEated');

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

/**
 * Process food sprites and events
 */
function processFood() {
  //iterate trough the predator and move & find survivors
  for (var i = 0; i < foodInfo.length; i++) {

    foodInfo[i].direction += foodInfo[i].turningSpeed * 0.01;
    foodInfo[i].x += Math.sin(foodInfo[i].direction) * (foodInfo[i].speed * foodInfo[i].scale.y);
    foodInfo[i].y += Math.cos(foodInfo[i].direction) * (foodInfo[i].speed * foodInfo[i].scale.y);
    foodInfo[i].rotation = -foodInfo[i].direction + Math.PI;

    // wrap container and position 

    if (foodInfo[i].x < foodInfo[i].foodBounds.x) {
      foodInfo[i].x += foodInfo[i].foodBounds.width;
    } else if (foodInfo[i].x > foodInfo[i].foodBounds.x + foodInfo[i].foodBounds.width) {
      foodInfo[i].x -= foodInfo[i].foodBounds.width;
    }

    if (foodInfo[i].y < foodInfo[i].foodBounds.y) {
      foodInfo[i].y += foodInfo[i].foodBounds.height;
    } else if (foodInfo[i].y > foodInfo[i].foodBounds.y + foodInfo[i].foodBounds.height) {
      foodInfo[i].y -= foodInfo[i].foodBounds.height;
    }
  }
}

/**
 * Survivors logic
 */
function processSurvivor() {

  // iterate through the survivors and find food, move, dodge
  for (var i = 0; i < survivorsInfo.length; i++) {

    if (survivorsInfo[i] && !survivorsInfo[i].isDead) {

      //look for food
      survivorsInfo[i].findFood(foodInfo);

      //check for predator and change direction, it will cancel other movements
      //todo : check if survivors can be brave and ignore predators
      for (let i = 0; i < predatorsInfo.length; i++) {
        survivorsInfo[i].evadePredator(predatorsInfo[i]);
      }

      //check for border colission and change direction
      survivorsInfo[i].setDirection(survivorsInfo[i].sprite.handleBorderCollition());

      let cr = survivorsInfo[i].findMate(survivorsInfo);
      if (cr && cr.canReproduce == true) {
        console.log("PUEDE CULIAR " + cr.partnerUid);
        //let partner = survivorsInfo.find(o=>o.uid == cr.partnerUid);
        //partner.isCopuling = true;
        let idx = survivorsInfo.map(o => o.uid)
          .indexOf(cr.partnerUid);
        survivorsInfo[idx].isCopuling = true;
        survivorsInfo[i].isCopuling = true;
        let reproduction = new Reproduction(survivorsInfo[i], survivorsInfo[idx]);
        let son = reproduction.Evolve();
        childInfo.push(son);
        //Create Childs
        CreateNewSurvivors(childInfo);
      } else {
        survivorsInfo[i].isCopuling = false;
      }

      //sobreviviente comio?

      let survivorEating = b.hit(
        survivorsInfo[i].sprite, foodInfo, false, false, false,
        function(collision, food) {
          if (!food.eated) {
            food.eated = true;
            foodContainer.removeChild(food);
            foodInfo.splice(food.idx, 1);
            survivorsInfo[i].eat();
            //console.log("survivor #" + survivorsInfo[i].idx + " - Comidos: " + survivorsInfo[i].numBugEated);
          }
        }
      );

      //Move
      survivorsInfo[i].move();

      //TODO REVISAR SI L HABILITO
      //survivorsInfo[i].WrapContainer();

    }

  }

}

/**
 * Predators logic
 */
function processPredator() {

  //iterate trough the predator and move & find survivors
  for (var i = 0; i < predatorsInfo.length; i++) {

    //predatorsInfo[i].scale.y = 0.95 + Math.sin(tick + predatorsInfo[i].offset) * 0.05;

    //Look for food
    predatorsInfo[i].findSurvivors(survivorsInfo);
    //predatorsInfo[i].direction = predatorsInfo[i].handleBorderCollition();
    //predatorsInfo[i].x += Math.sin(predatorsInfo[i].direction) * (predatorsInfo[i].speed);
    //predatorsInfo[i].y += Math.cos(predatorsInfo[i].direction) * (predatorsInfo[i].speed);

    //check for border colission and change direction
    predatorsInfo[i].setDirection(predatorsInfo[i].sprite.handleBorderCollition());

    //predatorsInfo[i].rotation = -predatorsInfo[i].direction + Math.PI;

    /* //mover piloto automatico
    myEater.scale.y = 0.95 + Math.sin(tick + myEater.offset) * 0.05;
    myEater.direction += myEater.turningSpeed * 0.01;
    myEater.direction = myEater.handleBorderCollition();
    myEater.x += Math.sin(myEater.direction) * (myEater.speed * myEater.scale.y);
    myEater.y += Math.cos(myEater.direction) * (myEater.speed * myEater.scale.y);
    myEater.rotation = -myEater.direction + Math.PI;
    */
    // wrap the eater 
    /*
        if (myEater.x < myEater.eaterBounds.x) {
            myEater.x += myEater.eaterBounds.width;
        }
        else if (myEater.x > myEater.eaterBounds.x + myEater.eaterBounds.width) {
            myEater.x -= myEater.eaterBounds.width;
        }

        if (myEater.y < myEater.eaterBounds.y) {
            myEater.y += myEater.eaterBounds.height;
        }
        else if (myEater.y > myEater.eaterBounds.y + myEater.eaterBounds.height) {
            myEater.y -= myEater.eaterBounds.height;
        }
*/

    //if predator is eating

    //survivorsInfo.map(a=>a.sprite)

    let PredatorEating = b.hit(
      predatorsInfo[i].sprite, survivorsInfo.map(a => a.sprite), false, false, false,
      function(collision, dude) {
        //survivorsContainer.removeChild(dude);
        //debugContainer.removeChild(debugInfo[dude.idx]);
        let survivor = survivorsInfo.find(o => o.uid == dude.uid);
        survivor.isDead = true;
        KillSurvivor(survivor);
        //dude.IsDead = true;
        //deadSurvivors.push(dude);
        console.log("survivor #" + dude.uid + " is dead (eaten)");
        //survivorsInfo.splice(dude.idx,1);
        //debugInfo.splice(dude.idx,1);
        //TODO: FIX this, survivorsInfo is not discounting
        predatorsInfo[i].eat();
        //console.log("PREDATOR : Cantidad Comidos " + myEater.numsurvivorsEated);
      }
    );

    //Move (apply direction / angle / speed values)
    predatorsInfo[i].move();

  }
}

/**
 * Remove survivor from simulation arrays (PIXI containers and logic arrays)
 * @param {survivor} survivor object 
 */
function KillSurvivor(survivor) {
  survivorsContainer.removeChild(survivor.sprite);
  debugContainer.removeChild(debugInfo.find(o => o.uid == survivor.uid));
  deadSurvivors.push(survivorsInfo.find(o => o.uid == survivor.uid));
  survivorsInfo = survivorsInfo.filter(o => o.uid !== survivor.uid)
  debugInfo = debugInfo.filter(o => o.uid !== survivor.uid);
}

/**
 * Check deads, food status, predators and environment
 * 
 */
function checkSimulationStatus(delta) {
  for (var i = 0; i < survivorsInfo.length; i++) {
    if (survivorsInfo[i]) {
      if (survivorsInfo[i].isDead) {
        console.log("survivor #" + survivorsInfo[i].uid + " is dead (Starving)");
        KillSurvivor(survivorsInfo[i]);
        /*
        survivorsContainer.removeChild(survivorsInfo[i].sprite);
        debugContainer.removeChild(debugInfo[i].sprite);
        deadSurvivors.push(survivorsInfo[i]);
        survivorsInfo.splice(i,1);
        debugInfo.splice(i,1);
        */
      } else {
        survivorsInfo[i].consumeEnergy();
        //get old
        survivorsInfo[i].addLivingTime();
        if (survivorsInfo[i].livingTime >= config.creature.adultAge) {
          survivorsInfo[i].sprite.tint = Constants.colors.RED;
        }

        if (survivorsInfo[i].livingTime >= config.creature.elderAge) {
          survivorsInfo[i].sprite.tint = Constants.colors.GREEN;
        }
      }
    }
  }

  //Regenerate Food
  LoadFood(helper.generateRandomInteger(0, config.world.maxFoodGenerationRatio));

}

/**
 * End loop
 */
function cleanUpLoop() {

  /*
  for (var i = 0; i < survivorsInfo.length; i++) {
      survivorsInfo[i].setIdx(i);
  }
  */

  for (var i = 0; i < foodInfo.length; i++) {
    foodInfo[i].idx = i;
  }

  /*
  for (var i=0; i< debugInfo.length; i++) {
      debugInfo[i].idx = i;
  }
  */

  syncArrays();

}

/**
 * Generate food objects (both PIXI sprites and Food attributes)
 * @param {*} numSprites config.world.food  
 */
function LoadFood(numSprites) {

  for (var i = 0; i < numSprites; i++) {

    let opt = {
      i: i,
      screenWidth: app.screen.width,
      screenHeight: app.screen.height
    }

    let obj = SpriteFactory.create("FoodSprite", opt);
    foodInfo.push(obj.getSprite());
    foodContainer.addChild(obj.getSprite());

  }

}

/**
 * Generate Predators objects (both PIXI sprites and Predators attributes)
 * @param {*} numSprites config.world.predators 
 */
function InitPredators(numSprites, population) {

  var population = [];

  for (var i = 0; i < numSprites; i++) {

    // create a new survivor Sprite
    //let p = new Survivor(PIXI).Init(i,population[i], app);
    let opt = {
      PIXI: PIXI,
      dna: population[i],
      i: i,
      //sprite: predatorSprite.Init(app.screen.width, app.screen.height)
      sprite: SpriteFactory.create("PredatorSprite", { screenWidth: app.screen.width, screenHeight: app.screen.height,
          i: i })
        .getSprite()
    }

    let p = CreatureFactory.create("Predator", opt);
    console.log(p.collectStats());

    // finally we push the sprite into the survivors array so it it can be easily accessed later
    predatorsInfo.push(p);
    predatorsContainer.addChild(p.sprite);

    addDebugInfo(p);

  }

}

/**
 * Generate Survivors objects (Both PIXI Sprites and survivor attributes)
 * @param {*} numSprites 
 * @param {*} population initialization dna
 */
function InitSurvivors(numSprites, population) {

  var population = [];

  for (var i = 0; i < numSprites; i++) {

    // create a new survivor Sprite
    //let p = new Survivor(PIXI).Init(i,population[i], app);
    let opt = {
      PIXI: PIXI,
      dna: population[i],
      i: i,
      //sprite: survivorSprite.Init(app.screen.width, app.screen.height)
      sprite: SpriteFactory.create("SurvivorSprite", { screenWidth: app.screen.width, screenHeight: app.screen.height,
          i: i })
        .getSprite()
    }

    let p = CreatureFactory.create("Survivor", opt);

    // finally we push the sprite into the survivors array so it it can be easily accessed later
    survivorsInfo.push(p);
    survivorsContainer.addChild(p.sprite);

    addDebugInfo(p);
  }

}

/**
 * Add new Survivor to the world
 * @param {} population dna for new survivors 
 * TODO : REvisar por que llegan 2 iguales pero con padres cambiados
 */
function CreateNewSurvivors(population) {
  for (var i = 0; i < population.length; i++) {
    //let p = new Survivor(PIXI).Init(survivorsInfo.length,population[i], app);

    let opt = {
      PIXI: PIXI,
      dna: population[i],
      i: survivorsInfo.length,
      //sprite: survivorSprite.Init(app.screen.width, app.screen.height)
      sprite: SpriteFactory.create("SurvivorSprite", { screenWidth: app.screen.width, screenHeight: app.screen.height,
          i: survivorsInfo.length })
        .getSprite()
    }

    let p = CreatureFactory.create("Survivor", opt);

    survivorsInfo.push(p);
    survivorsContainer.addChild(p.sprite);
    //add children uid to parents childrens list
    //TODO : REPARAR ESTO (ya no se usa la property index).
    survivorsInfo.find(o => o.uid == opt.dna.parent1Uid)
      .addChildren(p.uid);
    survivorsInfo.find(o => o.uid == opt.dna.parent2Uid)
      .addChildren(p.uid);
    childInfo = []; //clean the childs buffer
    //TODO add children to survivor
    addDebugInfo(p);
  }
}

function LoadUiInformation() {
  //UI Information
  uiTextInfo = new UiTextInfo("#Food : " + totalFood + " - #Objects : " + totalSurvivors + " - #Predators: " +
    totalPredators, {
      fontWeight: 'bold',
      //fontStyle: 'italic',
      fontSize: 17,
      //fontFamily: 'Arvo',
      fill: '#FFFFFF',
      align: 'center',
      //stroke: '#a4410e',
      strokeThickness: 2
    });

  uiTextInfo.x = app.screen.width / 2;
  uiTextInfo.y = app.screen.height - 30;
  uiTextInfo.anchor.x = 0.5;
}

function UpdateUI(sprites, predators, food, iteration, generationNumber, generationStats) {
  uiTextInfo.text = "Generation N° : " + generationNumber + " - Iteration N° : " + iteration +
    " - Best Generation Fitness : " + generationStats.BestFitness + " - [ #Food : " + food + " - #Survivors : " +
    sprites + " - #Predators: " + predators + " ] - FPS : " + Math.round(app.ticker.FPS);
}

function addDebugInfo(survivor) {
  var graph = new PIXI.Graphics();
  graph.beginFill(0xFFFF0B, 0.2);
  graph.lineStyle(1, 0xffd900, 0);
  //graph.drawRect(0,0,300,300);
  graph.drawCircle(survivor.x, survivor.y, survivor.visionRange);
  graph.endFill();
  var img = new PIXI.Sprite(graph.generateTexture());
  img.idx = survivor.idx;
  img.uid = survivor.uid;
  img.anchor.set(0.5);
  debugContainer.addChild(img);
  debugInfo.push(img);
}
/*
function LoadDebugInfo() {
    
    for (let i = 0; i<survivorsInfo.length; i++) {
        var graph = new PIXI.Graphics();
        graph.beginFill(0xFFFF0B, 0.2);
        graph.lineStyle(1, 0xffd900, 0);
        //graph.drawRect(0,0,300,300);
        graph.drawCircle(survivorsInfo[i].x, survivorsInfo[i].y,survivorsInfo[i].visionRange);
        graph.endFill();
        var img = new PIXI.Sprite(graph.generateTexture());
        img.survivor = {idx : survivorsInfo[i].idx};
        img.anchor.set(0.5);
        debugContainer.addChild(img);
        debugInfo.push(img);
    }
    
}
*/

function syncArrays() {
  let survivorsLen = survivorsInfo.length;
  let debugLen = debugInfo.length;
  let deadLen = deadSurvivors.length;

  let nullSurvivors = survivorsInfo.find(o => o.uid == null || undefined);
  let nullDebug = survivorsInfo.find(o => o.uid == null || undefined);;
}

function UpdateDebugInfo(op, survivor) {

  for (let i = 0; i < debugInfo.length; i++) {
    if (survivorsInfo[i]) {
      debugInfo[i].x = survivorsInfo[i].sprite.x;

      debugInfo[i].y = survivorsInfo[i].sprite.y;
    }
  }

  if (debugModeOn) {
    debugContainer.alpha = 0.3;
  } else {
    debugContainer.alpha = 0;
  }

}

function onKeyDown(key) {

  if (key.keyCode === 32) {
    debugModeOn = !debugModeOn;
  }
}

document.addEventListener('keydown', onKeyDown);
