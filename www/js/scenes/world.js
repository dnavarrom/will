/*eslint-disable*/
class World {
  constructor(app, b) {

    //app.stage.filters = [ new PIXI.filters.OldFilmFilter(0)];
    //app.stage.scale.x = 1.5;
    //app.stage.scale.y = 1.5;
    // global : create an array to store all the sprites and information
    this.survivorsInfo = [];
    this.childInfo = [];
    this.predatorsInfo = [];
    this.foodInfo = [];
    this.targetMateLineInfo = [];
    this.debugInfo = [];
    this.creatureHudInfo = [];

    this.b = b; //bump

    //var totalSurvivors = app.renderer instanceof PIXI.WebGLRenderer ? 10000 : 100;
    this.totalSurvivors = config.world.survivors;
    this.totalPredators = config.world.predators;
    this.totalFood = config.world.food;

    //collect status
    this.deadSurvivors = [];
    this.generationStats = [];
    this.generationStats.push({ BestsurvivorId: -1, WorsesurvivorId: -1, BestFitness: -1, WorseFitness: -1 });

    this.survivorsContainer = new PIXI.Container(10000, {
      scale: true,
      position: true,
      rotation: true,
      uvs: true,
      alpha: true
    });

    app.stage.addChild(this.survivorsContainer);

    this.predatorsContainer = new PIXI.particles.ParticleContainer(100, {
      scale: true,
      position: true,
      rotation: true,
      uvs: true,
      alpha: true
    });

    app.stage.addChild(this.predatorsContainer);

    this.foodContainer = new PIXI.particles.ParticleContainer(1000, {
      scale: true,
      position: true,
      rotation: true,
      uvs: true,
      alpha: true
    });

    app.stage.addChild(this.foodContainer);

    this.debugContainer = new PIXI.particles.ParticleContainer(1000, {
      scale: true,
      position: true,
      rotation: true,
      uvs: true,
      alpha: true
    });

    app.stage.addChild(this.debugContainer);

    this.creatureHudContainer = new PIXI.Container(1000, {
      scale: true,
      position: true,
      rotation: true,
      uvs: true,
      alpha: true
    })
    app.stage.addChild(this.creatureHudContainer);
    this.showEnergyBar = false;

    this.targetMateLineContainer = new PIXI.Container(1000, {
      scale: true,
      position: true,
      rotation: true,
      uvs: true,
      alpha: true
    });

    app.stage.addChild(this.targetMateLineContainer);

    this.containers = {
      predatorsContainer: this.predatorsContainer,
      survivorsContainer: this.survivorsContainer,
      foodContainer: this.foodContainer,
      debugContainer: this.debugContainer,
      creatureHudContainer: this.creatureHudContainer,
      targetMateLineContainer: this.targetMateLineContainer
    };

    this.worldInfo = {
      survivorsInfo: this.survivorsInfo,
      childInfo: this.childInfo,
      predatorsInfo: this.predatorsInfo,
      foodInfo: this.foodInfo,
      debugInfo: this.debugInfo,
      creatureHudInfo: this.creatureHudInfo,
      targetMateLineInfo: this.targetMateLineInfo,
      deadSurvivors: this.deadSurvivors
    };

  }

  init() {
    this.initPredators(this.totalPredators);
    this.initSurvivors(this.totalSurvivors);
    this.loadFood(this.totalFood);
  }

  showScene() {
    for (var key in this.containers) {
      if (this.containers.hasOwnProperty(key)) {
        this.containers[key].alpha = 1;
      }
    }
  }

  hideScene() {
    for (var key in this.containers) {
      if (this.containers.hasOwnProperty(key)) {
        this.containers[key].alpha = 0;
      }
    }
  }

  /**
   * Generate food objects (both PIXI sprites and Food attributes)
   * @param {*} numSprites config.world.food  
   */
  loadFood(numSprites) {

    if (this.foodInfo.length >= config.world.maxFood)
      return;

    for (var i = 0; i < numSprites; i++) {

      let opt = {
        i: i,
        screenWidth: app.screen.width,
        screenHeight: app.screen.height
      }

      let obj = SpriteFactory.create("FoodSprite", opt);
      this.foodInfo.push(obj.getSprite());
      this.foodContainer.addChild(obj.getSprite());

    }

  }

  /**
   * Check deads, food status, predators and environment
   * 
   */
  checkSimulationStatus(delta) {
    for (var i = 0; i < this.survivorsInfo.length; i++) {
      if (this.survivorsInfo[i]) {
        if (this.survivorsInfo[i].isDead) {
          console.log("survivor #" + this.survivorsInfo[i].uid + " is dead (Starving)");
          this.killSurvivor(this.survivorsInfo[i]);
        } else {
          this.survivorsInfo[i].consumeEnergy();
          //get old
          this.survivorsInfo[i].addLivingTime();
          if (this.survivorsInfo[i].livingTime >= config.creature.adultAge) {
            this.survivorsInfo[i].sprite.tint = Constants.colors.RED;
          }

          if (this.survivorsInfo[i].livingTime >= config.creature.elderAge) {
            this.survivorsInfo[i].sprite.tint = Constants.colors.GREEN;
          }
        }
      }
    }
  }

  /**
   * Generate Predators objects (both PIXI sprites and Predators attributes)
   * @param {*} numSprites config.world.predators 
   */
  initPredators(numSprites, population) {

    var population = [];

    for (var i = 0; i < numSprites; i++) {

      // create a new survivor Sprite
      //let p = new Survivor(PIXI).Init(i,population[i], app);
      let opt = {
        PIXI: PIXI,
        dna: population[i],
        i: i,
        //sprite: predatorSprite.Init(app.screen.width, app.screen.height)
        sprite: SpriteFactory.create("PredatorSprite", {
            screenWidth: app.screen.width,
            screenHeight: app.screen.height,
            i: i
          })
          .getSprite()
      }

      let p = CreatureFactory.create("Predator", opt);
      console.log(p.collectStats());

      // finally we push the sprite into the survivors array so it it can be easily accessed later
      this.predatorsInfo.push(p);
      this.predatorsContainer.addChild(p.sprite);

      //this.addDebugInfo(p);

    }

  }

  /**
   * Generate Survivors objects (Both PIXI Sprites and survivor attributes)
   * @param {*} numSprites 
   * @param {*} population initialization dna
   */
  initSurvivors(numSprites, population) {

    var population = [];

    for (var i = 0; i < numSprites; i++) {

      // create a new survivor Sprite
      //let p = new Survivor(PIXI).Init(i,population[i], app);
      let opt = {
        PIXI: PIXI,
        dna: population[i],
        isHumanControlled: false,
        i: i,
        //sprite: survivorSprite.Init(app.screen.width, app.screen.height)
        sprite: SpriteFactory.create("SurvivorSprite", {
            screenWidth: app.screen.width,
            screenHeight: app.screen.height,
            i: i,
            isHumanControlled :false
          })
          .getSprite()
      }

      let p = CreatureFactory.create("Survivor", opt);

      // finally we push the sprite into the survivors array so it it can be easily accessed later
      this.survivorsInfo.push(p);
      this.survivorsContainer.addChild(p.sprite);

      this.addDebugInfo(p);
      this.addReproductionTargetLine(p);
      this.addCreatureHudInformation(p);
    }
  }

  /**
   * Add new Survivor to the world
   * @param {} population dna for new survivors 
   * TODO : REvisar por que llegan 2 iguales pero con padres cambiados
   */
  createNewSurvivors(population) {

    if (this.survivorsInfo.length >= config.world.maxSurvivors) {
      this.childInfo = [];
      return;
    }

    //TODO: Que no sean arreglos
    for (var i = 0; i < population.length; i++) {
      //let p = new Survivor(PIXI).Init(this.survivorsInfo.length,population[i], app);

      let opt = {
        PIXI: PIXI,
        dna: population[i],
        isHumanControlled: population[i].isHumanControlled,
        i: this.survivorsInfo.length,
        //sprite: survivorSprite.Init(app.screen.width, app.screen.height)
        sprite: SpriteFactory.create("SurvivorSprite", {
            screenWidth: app.screen.width,
            screenHeight: app.screen.height,
            i: this.survivorsInfo.length,
            isHumanControlled : population[i].isHumanControlled
          })
          .getSprite()
      }

      let p = CreatureFactory.create("Survivor", opt);

      this.survivorsInfo.push(p);
      this.survivorsContainer.addChild(p.sprite);
      //add children uid to parents childrens list
      //TODO : REPARAR ESTO (ya no se usa la property index).
      this.survivorsInfo.find(o => o.uid == opt.dna.parent1Uid)
        .addChildren(p.uid);
      this.survivorsInfo.find(o => o.uid == opt.dna.parent2Uid)
        .addChildren(p.uid);
      this.childInfo = []; //clean the childs buffer
      //TODO add children to survivor
      this.addDebugInfo(p);
      this.addCreatureHudInformation(p);
    }
  }

  addDebugInfo(survivor) {

    //Circle
    var graph = new PIXI.Graphics();
    graph.beginFill(0xFFFF0B, 0.2);
    graph.lineStyle(1, 0xffd900, 0);
    //graph.drawRect(0,0,300,300);
    graph.drawCircle(survivor.x, survivor.y, survivor.visionRange);
    graph.endFill();
    var img = new PIXI.Sprite(graph.generateTexture());
    img.uid = survivor.uid;
    img.anchor.set(0.5);
    this.debugContainer.addChild(img);
    this.debugInfo.push(img);
  }

  addCreatureHudInformation(survivor) {

    let hudTextInfo = new EnergyBarSprite({ app: app, survivor: survivor });
    this.creatureHudContainer.addChild(hudTextInfo);
    this.creatureHudInfo.push(hudTextInfo);
  }

  addReproductionTargetLine(survivor) {
    let graph = new PIXI.Graphics();
    graph.uid = survivor.uid;
    this.targetMateLineContainer.addChild(graph);
    this.targetMateLineInfo.push(graph);

  }

  showLineage() {
    for (let i = 0; i < this.survivorsInfo.length; i++) {
      for (let j = 0; j < this.survivorsInfo[i].childrens.length; j++) {
        let childrenObj = this.survivorsInfo.find(o => o.uid == this.survivorsInfo[i].childrens[j]);
        if (childrenObj) {
          let currentLine = this.targetMateLineInfo.find(o => o.uid == this.survivorsInfo[i].sprite.uid);
          if (currentLine) {
            currentLine.clear();
            currentLine.lineStyle(1, Constants.colors.BLUE, 1)
              .moveTo(this.survivorsInfo[i].sprite.x, this.survivorsInfo[i].sprite.y)
              .lineTo(childrenObj.sprite.x, childrenObj.sprite.y);
            currentLine.beginFill(0.2);
            currentLine.endFill();
          }
        }
      }
    }
  }

  /**
   * Process food sprites and events
   */
  processFood() {
    //iterate trough the predator and move & find survivors
    for (var i = 0; i < this.foodInfo.length; i++) {

      this.foodInfo[i].direction += this.foodInfo[i].turningSpeed * 0.01;
      //check for border colission and change direction
      this.foodInfo[i].direction = this.foodInfo[i].handleBorderCollition();
      this.foodInfo[i].x += Math.sin(this.foodInfo[i].direction) * (this.foodInfo[i].speed * this.foodInfo[i].scale.y);
      this.foodInfo[i].y += Math.cos(this.foodInfo[i].direction) * (this.foodInfo[i].speed * this.foodInfo[i].scale.y);
      this.foodInfo[i].rotation = -this.foodInfo[i].direction + Math.PI;

      // wrap container and position 

      /*
      if (this.foodInfo[i].x < this.foodInfo[i].foodBounds.x) {
        this.foodInfo[i].x += this.foodInfo[i].foodBounds.width;
      } else if (this.foodInfo[i].x > this.foodInfo[i].foodBounds.x + this.foodInfo[i].foodBounds.width) {
        this.foodInfo[i].x -= this.foodInfo[i].foodBounds.width;
      }

      if (this.foodInfo[i].y < this.foodInfo[i].foodBounds.y) {
        this.foodInfo[i].y += this.foodInfo[i].foodBounds.height;
      } else if (this.foodInfo[i].y > this.foodInfo[i].foodBounds.y + this.foodInfo[i].foodBounds.height) {
        this.foodInfo[i].y -= this.foodInfo[i].foodBounds.height;
      }
      */
    }
  }

  /**
   * Predators logic
   */
  processPredator() {

    //iterate trough the predator and move & find survivors
    for (var i = 0; i < this.predatorsInfo.length; i++) {

      //Look for food
      this.predatorsInfo[i].findSurvivors(this.survivorsInfo);

      //check for border colission and change direction
      this.predatorsInfo[i].setDirection(this.predatorsInfo[i].sprite.handleBorderCollition());

      let PredatorEating = this.b.hit(
        this.predatorsInfo[i].sprite, this.survivorsInfo.map(a => a.sprite), false, false, false,
        function(collision, dude) {
          let survivor = this.survivorsInfo.find(o => o.uid == dude.uid);
          //survivor.isDead = true;
          this.killSurvivor(survivor);
          console.log("survivor #" + dude.uid + " is dead (eaten)");

          //TODO: FIX this, this.survivorsInfo is not discounting
          this.predatorsInfo[i].eat();
        }.bind(this)
      );

      //Move (apply direction / angle / speed values)
      this.predatorsInfo[i].move();

    }
  }

  /**
   * Remove survivor from simulation arrays (PIXI containers and logic arrays)
   * @param {survivor} survivor object 
   */
  killSurvivor(survivor) {
    this.survivorsContainer.removeChild(survivor.sprite);
    this.debugContainer.removeChild(this.debugInfo.find(o => o.uid == survivor.uid));
    this.creatureHudContainer.removeChild(this.creatureHudInfo.find(o => o.uid == survivor.uid));
    this.deadSurvivors.push(this.survivorsInfo.find(o => o.uid == survivor.uid));
    this.survivorsInfo = this.survivorsInfo.filter(o => o.uid !== survivor.uid)
    this.debugInfo = this.debugInfo.filter(o => o.uid !== survivor.uid);
    this.creatureHudInfo = this.creatureHudInfo.filter(o => o.uid !== survivor.uid);
    this.clearChildrenTreeLine(survivor);
  }

  clearChildrenTreeLine(survivor) {
    let currentLine = this.targetMateLineInfo.find(o => o.uid == survivor.uid);
    if (currentLine) {
      currentLine.clear();
      this.targetMateLineContainer.removeChild(currentLine);
      this.targetMateLineInfo = this.targetMateLineInfo.filter(o => o.uid !== currentLine.uid);
    }
  }

  /**
   * Calculate fitness and evaluate generation
   */
  evaluateGeneration() {

    var survivorsOrderedInfo = [];

    //ordenado de menor a mayor
    survivorsOrderedInfo = _.sortBy(_.union(this.survivorsInfo, this.deadSurvivors), "numBugEated");

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
    this.generationStats.push(thisGen);

  }

  spawnHumanControlledCreatureHandler() {
    

    let population = [];

    let opt = {
      PIXI: PIXI,
      dna: population[0],
      isHumanControlled: true,
      i: this.survivorsInfo.length,
      //sprite: survivorSprite.Init(app.screen.width, app.screen.height)
      sprite: SpriteFactory.create("SurvivorSprite", {
          screenWidth: app.screen.width,
          screenHeight: app.screen.height,
          i: this.survivorsInfo.length,
          isHumanControlled :true
        })
        .getSprite()
    }

    let p = CreatureFactory.create("Survivor", opt);

    this.survivorsInfo.push(p);
    this.survivorsContainer.addChild(p.sprite);
    this.addDebugInfo(p);
    this.addReproductionTargetLine(p);
    this.addCreatureHudInformation(p);


    app.stage.interactive = true;

  }

  processSurvivor() {

    // iterate through the survivors and find food, move, dodge
    for (var i = 0; i < this.survivorsInfo.length; i++) {

      if (this.survivorsInfo[i] && !this.survivorsInfo[i].isDead) {

        this.survivorsInfo[i].getCurrentStatus();
        this.survivorsInfo[i].checkIfCopuling();

        /**** 
         * FIRST PRIORITY : Find Food and survive
         */
        if (!this.survivorsInfo[i].reproductionStatus.isCopuling) {
          this.survivorsInfo[i].findFood(this.foodInfo);
        }

        //check for predator and change direction, it will cancel other movements
        //todo : check if survivors can be brave and ignore predators
        for (let j = 0; j < this.predatorsInfo.length; j++) {
          this.survivorsInfo[i].evadePredator(this.predatorsInfo[j]);
        }

        /**
         * Second priority : reproduce 
         */

        //during copuling
        if (this.survivorsInfo[i].reproductionStatus.isCopuling) {} else {

          //after
          if (this.survivorsInfo[i].reproductionStatus.isCopulingFinished &&
            !this.survivorsInfo[i].reproductionStatus.isCopuling &&
            !this.survivorsInfo[i].reproductionStatus.isFindingMate) {
            //start to generate sons
            let parent2 = this.survivorsInfo.find(o => o.uid == this.survivorsInfo[i].getCurrentMate())
            if (parent2) {
              let son = this.survivorsInfo[i].reproduce(parent2);
              if (this.survivorsInfo[i].isHumanControlled || son.isHumanControlled) {
                son.isHumanControlled = true;
              }
              this.childInfo.push(son);
              this.createNewSurvivors(this.childInfo);
            } else {
              console.log(this.survivorsInfo[i].getCurrentMate() + " no encontrado");
            }

            //stop copuling / reset all
            this.survivorsInfo[i].reproductionStatus.isCopulingFinished = false;
            this.survivorsInfo[i].reproductionStatus.isCopuling = false;
            this.survivorsInfo[i].reproductionStatus.isFindingMate = false;

          }
        }

        //find mate to reproduce

        if (this.survivorsInfo[i].reproductionStatus.isCopuling ||
          this.survivorsInfo[i].reproductionStatus.isFindingMate) {
          let cr;
          if (this.survivorsInfo.length < config.world.maxSurvivors)
            cr = this.survivorsInfo[i].findMate(this.survivorsInfo);

          //check if they can reproduce
          if (cr && cr.canReproduce == true) {
            console.log("PUEDE CULIAR " + cr.partnerUid);
            //let partner = this.survivorsInfo.find(o=>o.uid == cr.partnerUid);
            //partner = true;
            let idx = this.survivorsInfo.map(o => o.uid)
              .indexOf(cr.partnerUid);

            if (this.survivorsInfo[i].reproductionStatus.isFindingMate) {
              this.survivorsInfo[idx].startCopuling();
              this.survivorsInfo[i].startCopuling();
              this.survivorsInfo[idx].setCurrentMate(this.survivorsInfo[i].uid);
              this.survivorsInfo[i].setCurrentMate(this.survivorsInfo[idx].uid);
            }

          }
        }

        //check for border colission and change direction
        this.survivorsInfo[i].setDirection(this.survivorsInfo[i].sprite.handleBorderCollition());

        //sobreviviente comio?

        let survivorEating = this.b.hit(
          this.survivorsInfo[i].sprite, this.foodInfo, false, false, false,
          function(collision, food) {
            if (!food.eated) {
              food.eated = true;
              this.foodContainer.removeChild(food);
              //this.foodInfo.splice(food.idx, 1);
              this.foodInfo = this.foodInfo.filter(o => o.uid !== food.uid);
              this.survivorsInfo[i].eat();
              //console.log("survivor #" + this.survivorsInfo[i].idx + " - Comidos: " + this.survivorsInfo[i].numBugEated);
            }
          }.bind(this)
        );

        //Move
        this.survivorsInfo[i].move();

        //TODO REVISAR SI L HABILITO
        //this.survivorsInfo[i].WrapContainer();

      }

    }

  }

  //TODO : no uso estas variables.. raro lo que pensé.
  updateDebugInfo(op, survivor) {

    for (let i = 0; i < this.debugInfo.length; i++) {
      let surv = this.survivorsInfo.find(o => o.uid == this.debugInfo[i].uid);
      if (surv) {
        this.debugInfo[i].x = surv.sprite.x;
        this.debugInfo[i].y = surv.sprite.y;
      }
    }

    if (debugModeOn) {
      this.debugContainer.alpha = 0.3;
      this.targetMateLineContainer.alpha = 0.3;
    } else {
      this.debugContainer.alpha = 0;
      this.targetMateLineContainer.alpha = 0;

    }

  }

  /* EVENT HANDLERS */

  showEnergyBarEventHandler() {

    this.showEnergyBar = !this.showEnergyBar;

    if (this.showEnergyBar)
      this.creatureHudContainer.alpha = 0.5;
    else
      this.creatureHudContainer.alpha = 0;

  }

  showVisionRangeHandler() {
    debugModeOn = !debugModeOn
  }

  updateCreatureHudInformation() {

    for (let i = 0; i < this.creatureHudInfo.length; i++) {
      let surv = this.survivorsInfo.find(o => o.uid == this.creatureHudInfo[i].uid);
      if (surv) {
        /*
        this.creatureHudInfo[i].x = surv.sprite.x - 10;
        this.creatureHudInfo[i].y = surv.sprite.y - 20;
        this.creatureHudInfo[i].text = helper.getEnergyBar(surv.collectStats()
          .energy); */

        this.creatureHudInfo[i].setEnergyBar(surv, helper.getEnergyBar(surv.collectStats()
          .energy));
      }
    }

    /*
    if (debugModeOn) {
      this.creatureHudContainer.alpha = 0.5;
    } else {
      this.creatureHudContainer.alpha = 0;
    }
    */

    if (this.showEnergyBar)
      this.creatureHudContainer.alpha = 0.5;
    else
      this.creatureHudContainer.alpha = 0;

  }

}
