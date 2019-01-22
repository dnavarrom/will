class World {
  constructor(app, b) {

    // global : create an array to store all the sprites and information
    this.survivorsInfo = [];
    this.childInfo = [];
    this.predatorsInfo = [];
    this.foodInfo = [];
    this.targetMateLineInfo = [];
    this.debugInfo = [];

    this.b = b; //bump

    //var totalSurvivors = app.renderer instanceof PIXI.WebGLRenderer ? 10000 : 100;
    this.totalSurvivors = config.world.survivors;
    this.totalPredators = config.world.predators;
    this.totalFood = config.world.food;

    //collect status
    this.deadSurvivors = [];

    this.survivorsContainer = new PIXI.particles.ParticleContainer(10000, {
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
      targetMateLineContainer: this.targetMateLineContainer
    };

    this.worldInfo = {
      survivorsInfo: this.survivorsInfo,
      childInfo: this.childInfo,
      predatorsInfo: this.predatorsInfo,
      foodInfo: this.foodInfo,
      debugInfo: this.debugInfo,
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

      this.addDebugInfo(p);

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
        i: i,
        //sprite: survivorSprite.Init(app.screen.width, app.screen.height)
        sprite: SpriteFactory.create("SurvivorSprite", {
            screenWidth: app.screen.width,
            screenHeight: app.screen.height,
            i: i
          })
          .getSprite()
      }

      let p = CreatureFactory.create("Survivor", opt);

      // finally we push the sprite into the survivors array so it it can be easily accessed later
      this.survivorsInfo.push(p);
      this.survivorsContainer.addChild(p.sprite);

      this.addDebugInfo(p);
      this.addReproductionTargetLine(p);
    }
  }

  /**
   * Add new Survivor to the world
   * @param {} population dna for new survivors 
   * TODO : REvisar por que llegan 2 iguales pero con padres cambiados
   */
  createNewSurvivors(population) {

    if (this.survivorsInfo.length >= config.world.maxSurvivors)
      return;

    for (var i = 0; i < population.length; i++) {
      //let p = new Survivor(PIXI).Init(this.survivorsInfo.length,population[i], app);

      let opt = {
        PIXI: PIXI,
        dna: population[i],
        i: this.survivorsInfo.length,
        //sprite: survivorSprite.Init(app.screen.width, app.screen.height)
        sprite: SpriteFactory.create("SurvivorSprite", {
            screenWidth: app.screen.width,
            screenHeight: app.screen.height,
            i: this.survivorsInfo.length
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

  addReproductionTargetLine(survivor) {
    let graph = new PIXI.Graphics();
    graph.uid = survivor.uid;
    this.targetMateLineContainer.addChild(graph);
    this.targetMateLineInfo.push(graph);

  }

  /**
   * Process food sprites and events
   */
  processFood() {
    //iterate trough the predator and move & find survivors
    for (var i = 0; i < this.foodInfo.length; i++) {

      this.foodInfo[i].direction += this.foodInfo[i].turningSpeed * 0.01;
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
      }*/
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
          let survivor = world.survivorsInfo.find(o => o.uid == dude.uid);
          survivor.isDead = true;
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
    this.deadSurvivors.push(this.survivorsInfo.find(o => o.uid == survivor.uid));
    this.survivorsInfo = this.survivorsInfo.filter(o => o.uid !== survivor.uid)
    this.debugInfo = this.debugInfo.filter(o => o.uid !== survivor.uid);
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

  processSurvivor() {

    // iterate through the survivors and find food, move, dodge
    for (var i = 0; i < this.survivorsInfo.length; i++) {

      if (this.survivorsInfo[i] && !this.survivorsInfo[i].isDead) {

        //look for food
        this.survivorsInfo[i].findFood(this.foodInfo);
        let cr;
        if (this.survivorsInfo.length < config.world.maxSurvivors)
          cr = this.survivorsInfo[i].findMate(this.survivorsInfo);
        //find mate

        if (cr && cr.canReproduce == true) {
          console.log("PUEDE CULIAR " + cr.partnerUid);
          //let partner = this.survivorsInfo.find(o=>o.uid == cr.partnerUid);
          //partner.isCopuling = true;
          let idx = this.survivorsInfo.map(o => o.uid)
            .indexOf(cr.partnerUid);
          this.survivorsInfo[idx].isCopuling = true;
          this.survivorsInfo[i].isCopuling = true;
          let reproduction = new Reproduction(this.survivorsInfo[i], this.survivorsInfo[idx]);
          let son = reproduction.Evolve();
          this.childInfo.push(son);
          //Create Childs
          this.createNewSurvivors(this.childInfo);
        } else {
          this.survivorsInfo[i].isCopuling = false;
          //if (cr) 
          //this.survivorsInfo[i].setDirection(cr.direction);
        }

        //check for predator and change direction, it will cancel other movements
        //todo : check if survivors can be brave and ignore predators
        for (let j = 0; j < this.predatorsInfo.length; j++) {
          this.survivorsInfo[i].evadePredator(this.predatorsInfo[j]);
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

}
