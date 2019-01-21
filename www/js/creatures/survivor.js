class Survivor extends Creature {

  constructor(opt) {
    super(opt);

    //surivor specific behavior
    this.isDodging = false;
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

  }

  /**
   * 
   */
  findMate(survivorInfo) {
    var nearestSurvivorUid = -1;
    var nearestSurvivorDistance = 1000;
    var mateFound = 0;
    var angle = 0;

    if (this.energy > this.maxEnergy / 2 && this.isDodging == false)
      this.isFindingMate = true;
    else
      this.isFindingMate = false;

    if (this.isFindingMate) {
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
            }
          }
        }
      }

      var objResult = {
        canReproduce: false,
        partnerUid: -1
      };

      if (mateFound > 0) {
        let survivor =  survivorInfo.find(o => o.uid == nearestSurvivorUid);

        if (this.checkReproductionConditions(survivor)) {
          this.nearestSurvivorDistance = nearestSurvivorDistance;
          this.nearestSurvivorUid = nearestSurvivorUid;
          this.setDirection(angle);
          this.isCopuling = true;
          this.mates.push(survivor.uid);

          objResult = {
            canReproduce: true,
            partnerUid: survivor.uid
          };

          console.log("puede");
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
    //only adults can reproduce
    if (survivor.livingTime < config.creature.adultAge) {
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
    if (this.isCopuling) {
      return false;
    }

    if (survivor.isCopuling) {
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
            (!survivorInfo[i].isCopuling && !this.isCopuling) &&
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

      this.isCopuling = true;
      survivorInfo[nearestSurvivorIdx].isCopuling = true;
      this.mates.push(survivorInfo[nearestSurvivorIdx].uid);

      return {
        canReproduce: true,
        partnerIdx: nearestSurvivorIdx,
      };
    } else {
      this.isCopuling = false;
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
    let dist = helper.CheckDistanceBetweenSprites(this.sprite, predator.sprite);
    if (dist.distance < this.visionRange) {
      if (this.isDodging == false) {
        this.setDirection(predator.direction + predator.direction*Math.random(30,60));
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
    this.energy += 1;
    this.nearestFoodDistance = 1000;
    this.nearestFoodIdx = 9999;
  }
}
