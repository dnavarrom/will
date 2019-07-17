class Survivor extends Creature {
  constructor(opt) {
    super(opt);

    //surivor specific behavior
    this.isDodging = false;
    this.predatorNear = false;
    this.numBugEated = 0;
    this.nearestFoodDistance = 1000;
    this.nearestFoodIdx = -1;
    this.creatureType = Constants.creatureTypes.SURVIVOR;

    this.nearestSurvivorDistance = 9000;
    this.nearestSurvivorUid = "";

    this.collectStats();
  }

  /**
   * 
   * @param {*} foodInfo 
   */
  findFood(foodInfo) {

    //checkear la comida mas cercana
    let nearFoodArray = [];

    /*
    if (this.isHumanControlled)
      return nearFoodArray;
    */

    var nearestFoodIdx;
    var nearestFoodDistance = 1000;
    var angle;
    var foodfound = 0;

    

    for (var j = 0; j < foodInfo.length; j++) {

      let dist = helper.CheckDistanceBetweenSprites(this.sprite, foodInfo[j]);

      if (nearestFoodDistance > dist.distance) {

        if (dist.distance < this.visionRange && !foodInfo[j].eated) {
          //console.log("comida cercana " + dude.nearestFoodDistance + " - distancia : " + dist.distance + " - angle : " +dist.angle + " - dudeDirection : " + dude.direction);

          nearestFoodDistance = dist.distance;
          nearestFoodIdx = j;
          angle = dist.angle;
          foodfound++;

          nearFoodArray.push(foodInfo[j]);

          if (nearFoodArray.length > 3)
            break;
        }
      }
    }

    //asignar target al worm

    if (foodfound == 0) {
      //sprite.tint = 0xFF0000;
      //dude.direction = Math.random() * Math.PI * 2;
      this.isBlind = true;
    } else {
      //asigno target normalmente
      this.nearestFoodDistance = nearestFoodDistance;
      this.nearestFoodIdx = nearestFoodIdx;
      this.setDirection(angle);
      this.isBlind = false;

    }

    //console.log("FIND FOOD RESULT : " + this.nearestFoodDistance);

    return nearFoodArray;

  }

  getCurrentStatus() {

    if (this.reproductionStatus.isCopuling) {
      this.reproductionStatus.isCopuling = true;
      this.reproductionStatus.isCopulingFinished = false;
      this.reproductionStatus.isFindingMate = false;
    }

    if (this.reproductionStatus.isCopuling == false && this.energy > this.maxEnergy / 2 && this.isDodging == false &&
      this.livingTime >= config.creature.adultAge) {
      this.isFindingMate = true;
      this.reproductionStatus.isFindingMate = true;
      this.reproductionStatus.isCopuling = false;
      this.reproductionStatus.isCopulingFinished = false;
    } else {
      this.isFindingMate = false;
      this.reproductionStatus.isFindingMate = false;
    }
  }

  move() {

    if (!this.reproductionStatus.isCopuling) {
      if (this.isHumanControlled) {
        let mousePosition = app.renderer.plugins.interaction.mouse.global;
        //let mousePosition = app.renderer.plugins.interaction.mouse.getLocalPosition(mp);
        app.renderer.plugins.interaction.mouse.reset();
        let r1 = {
          x : mousePosition.x,
          y : mousePosition.y
        };
  
        this.setDirection(helper.getAngleBetweenSprites(r1, this.sprite));
        this.sprite.rotation = this.sprite.direction + Math.PI/2;
        
        
        //let x = this.sprite.x + Math.sin(this.sprite.direction) * (this.speed); //* sprite.scale.y);
        //let y = this.sprite.y + Math.cos(this.sprite.direction) * (this.speed);
        let x = this.sprite.x + Math.cos(this.sprite.direction) * this.speed;
        let y = this.sprite.y + Math.sin(this.sprite.direction) * this.speed;

        this.setPosition(x, y);
      }
      else  {
      super.move();
      }
    }
    else {
        this.sprite.direction += 0.1;
        this.sprite.rotation = -this.sprite.direction + Math.PI;
        let x = this.sprite.x + Math.sin(this.sprite.direction) * (this.speed); //* sprite.scale.y);
        let y = this.sprite.y + Math.cos(this.sprite.direction) * (this.speed);
        this.setPosition(x, y);
      }
    
  }

  startCopuling() {
    this.reproductionStatus.isCopuling = true;
    this.reproductionStatus.isFindingMate = false;
    this.reproductionStatus.isCopulingFinished = false;
    this.reproductionTimer = 0;
  }

  endCopuling() {
    this.reproductionStatus.isCopuling = false;
    this.reproductionStatus.isFindingMate = false;
    this.reproductionStatus.isCopulingFinished = true;
    this.reproductionTimer = 0;
  }

  interruptCopuling() {
    this.reproductionStatus.isCopuling = false;
    this.reproductionStatus.isFindingMate = false;
    this.reproductionStatus.isCopulingFinished = false;
    this.reproductionTimer = 0;
  }

  checkIfCopuling() {
    if (this.reproductionStatus.isCopuling) {
      if (this.reproductionTimer < 5) {
        this.reproductionTimer += 0.01;
        this.reproductionStatus.isCopuling = true;
        this.reproductionStatus.isFindingMate = false;
        this.reproductionStatus.isCopulingFinished = false;
        this.sprite.tint = Constants.colors.BLUE;
      } else {
        this.reproductionStatus.isCopulingFinished = true;
        this.reproductionStatus.isCopuling = false;
        this.reproductionStatus.isFindingMate = false;
        this.setColorByAge();
      }
    }
    return this.reproductionStatus.isCopuling;
  }

  reproduce(parent2) {
    let reproduction = new Reproduction(this, parent2);
    let son = reproduction.Evolve();
    this.endCopuling();
    return son;
  }

  setColorByAge() {
    if (!this.isHumanControlled) {
      if (this.livingTime < config.creature.adultAge) {
        this.sprite.tint = Constants.colors.WHITE;
      } else if (this.livingTime >= config.creature.elderAge) {
        this.sprite.tint = Constants.colors.GREEN;
      } else {
        this.sprite.tint = Constants.colors.RED;
      }
    }
  }

  /**
   * 
   */
  findMate(survivorInfo) {

    if (this.isHumanControlled)
      return;

    var nearestSurvivorUid = -1;
    var nearestSurvivorDistance = 1000;
    var mateFound = 0;
    var angle = 0;

    if (this.reproductionStatus.isCopuling)
      return;

    /*
    if (this.energy > this.maxEnergy / 2 && this.isDodging == false) {
      this.isFindingMate = true;
      this.reproductionStatus.isFindingMate = true;
    }
    else {
      this.isFindingMate = false;
      this.reproductionStatus.isFindingMate = false;
    }
    */

    if (this.reproductionStatus.isFindingMate) {
      for (var i = 0; i < survivorInfo.length; i++) {
        if (survivorInfo[i] && !survivorInfo[i].isDead) {

          if (this.idx != i && this.uid != survivorInfo[i].uid) {
            let dist = helper.CheckDistanceBetweenSprites(this.sprite, survivorInfo[i].sprite);
            if (nearestSurvivorDistance > dist.distance &&
              dist.distance < this.visionRange) {
              nearestSurvivorDistance = dist.distance;
              nearestSurvivorUid = survivorInfo[i].uid;
              mateFound++;
              angle = dist.angle;
              break;
            }
          }
        }
      }

      var objResult = {
        canReproduce: false,
        partnerUid: -1
      };

      if (mateFound > 0) {
        let survivor = survivorInfo.find(o => o.uid == nearestSurvivorUid);

        if (nearestSurvivorDistance <= this.copulingDistance) {

          if (this.checkReproductionConditions(survivor)) {
            this.nearestSurvivorDistance = nearestSurvivorDistance;
            this.nearestSurvivorUid = nearestSurvivorUid;
            this.setDirection(angle);
            //this.reproductionStatus.isCopuling = true;
            //this.mates.push(survivor.uid);

            objResult = {
              canReproduce: true,
              partnerUid: survivor.uid
            };

          }
        } else {
          this.nearestSurvivorDistance = nearestSurvivorDistance;
          this.nearestSurvivorUid = nearestSurvivorUid;
          this.setDirection(angle);
          //this.reproductionStatus.isCopuling = false;

        }

      }

      return objResult
    }
  }

  checkReproductionConditions(survivor) {

    //not self reproduction
    if (survivor.uid == this.uid) {
      return false;
    }

    //only living creatures
    if (survivor.isDead || this.isDead) {
      return false;
    }

    //only adults can reproduce
    if (this.livingTime < config.creature.adultAge) {
      return false;
    }

    //from diferent genders
    if (this.gender == survivor.gender) {
      return false;
    }

    //with new partners (revisar)
    if (this.mates.indexOf(survivor.uid) != -1) {
      return false;
    }

    //not with childrens
    if (this.childrens.indexOf(survivor.uid) != -1) {
      return false;
    }

    //if fertility of both is ok 
    if (this.fertility < 0.3) {
      return false;
    }

    if (survivor.fertility < 0.3) {
      return false;
    }

    //they are not copuling at this moment
    if (this.reproductionStatus.isCopuling) {
      return false;
    }

    if (survivor.reproductionStatus.isCopuling) {
      return false;
    }

    //they are not in danger
    if (this.energy < this.maxEnergy / 2 || this.isDodging == true) {
      return false;
    }

    if (survivor.energy < survivor.maxEnergy / 2 || survivor.isDodging == true) {
      return false;
    }

    return true;

  }

  /**
   * 
   */
  /*
  canReproduce(survivorInfo) {

    var nearestSurvivorIdx = -1;
    var nearestSurvivorDistance = 1000;
    var puedeCuliar = 0;

    for (var i = 0; i < survivorInfo.length; i++) {
      if (this.idx != i) {
        let dist = helper.CheckDistanceBetweenSprites(this.sprite, survivorInfo[i].sprite);
        if (nearestSurvivorDistance > dist.distance) {

          if (dist.distance < this.visionRange &&
            (!survivorInfo[i].isCopuling && !this.reproductionStatus.isCopuling) &&
            (survivorInfo[i].uid != this.uid) &&
            !survivorInfo[i].isDead &&
            this.gender != survivorInfo[i].gender &&
            this.mates.indexOf(survivorInfo[i].uid) == -1 &&
            (this.fertility > 0.3 && survivorInfo[i].fertility > 0.3)) {
            nearestSurvivorDistance = dist.distance;
            nearestSurvivorIdx = i;
            puedeCuliar++;
          }
        }
      }
    }

    //Post loop
    if (puedeCuliar > 0) {

      this.reproductionStatus.isCopuling = true;
      survivorInfo[nearestSurvivorIdx].isCopuling = true;
      this.mates.push(survivorInfo[nearestSurvivorIdx].uid);

      return {
        canReproduce: true,
        partnerIdx: nearestSurvivorIdx,
      };
    } else {
      this.reproductionStatus.isCopuling = false;
      return {
        canReproduce: false,
        partnerIdx: -1
      }
    }

  };

  */

  /**
   * Change direction to evade predators (if they in vision Range)
   * @param predator : predator info
   */
  evadePredator(predator) {

    if (this.isHumanControlled)
      return;

    let dist = helper.CheckDistanceBetweenSprites(this.sprite, predator.sprite);
    if (dist.distance < this.visionRange) {
      if (this.isDodging == false) {
        this.setDirection(predator.direction + predator.direction * Math.random(30, 60));
        this.isDodging = true;
        //this.sprite.tint = Constants.colors.BLUE;
      }
    } else {
      this.isDodging = false;
      //this.sprite.tint = Constants.colors.WHITE;
    }
  };

  /**
   * When eat, add energy
   */
  eat() {
    this.numBugEated++;
    if (this.energy + 1 <= config.creature.maxEnergy)
      this.energy += 1;
    this.nearestFoodDistance = 1000;
    this.nearestFoodIdx = 9999;
  }
}
