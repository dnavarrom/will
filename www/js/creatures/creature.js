const GenerateRandomParameters = function() {
  let parameters = {};

  parameters.visionRange = helper.generateRandomInteger(config.creature.minVisionRange, config.creature.maxVisionRange);
  parameters.maxEnergy = helper.generateRandomInteger(1, config.creature.maxEnergy);
  parameters.turningSpeed = Math.random() - 0.8;
  parameters.speed = (2 + Math.random() * 2) * 0.2;
  parameters.fertility = Math.random(1);
  //parameters.copulingDistance = helper.generateRandomInteger(10, 50);
  parameters.copulingDistance = helper.generateRandomInteger(10, 20);
  parameters.braveness = Math.random(1);

  //console.log(parameters);

  return parameters;
}

class Creature {

  constructor(opt) {

    //ID and index in array
    this.uid = helper.generateGuid();
    this.idx = opt.i;

    //Sprite object attachment
    this.sprite = null;
    this.setSprite(opt.sprite);
    this.sprite.uid = this.uid;
    this.sprite.idx = this.idx;

    //Will
    //braveness
    this.braveness = opt.braveness;
    //horniness
    this.horniness = opt.horniness;


    //dna
    if (!opt.dna) {
      opt.dna = GenerateRandomParameters();
    }

    //attributes
    this.maxEnergy = opt.dna.maxEnergy;
    this.energy = this.maxEnergy; //init full
    this.visionRange = opt.dna.visionRange;
    this.speed = opt.dna.speed;
    this.gender = (Math.random(1) < 0.5) ? "MALE" : "FEMALE";
    this.fertility = opt.dna.fertility;
    this.copulingDistance = opt.dna.copulingDistance;
    this.turningSpeed = opt.dna.turningSpeed;
    this.livingTime = 0; //age
    this.livingTimeLimit = config.creature.livingTimeLimit; //life is over

    //status

    this.reproductionStatus = {
      isFindingMate : false,
      isCopuling : false,
      isCopulingFinished : false
    }

    this.isBlind = false;
    this.isDead = false;
    this.isCopuling = false;
    this.isFindingMate = false; //quiere follar

    //counters
    this.reproductionTimer = 0;

    //mates & childrens
    this.mates = []; //uid array  (not object)
    this.childrens = []; //uid array (not object)
    this.currentMate = ""; //uid

    //movement & position
    this.setPosition(Math.random() * this.sprite.appScreenWidth, Math.random() * this.sprite.appScreenHeight);
    this.setDirection(Math.random() * Math.PI * 2);
    this.setCenterCoordinates();

    this.stats = null;

  }

  willExecute(opt) {
     
     //options: eat, dodge or reproduce
     //priorities : survive, reproduction
     //logic : * more vision range, more chances to survive and reproduce
     //        * more speed, more chances to survive and reproduce
     // alternatives: 
     // if low energy then eat over reproduce
     // if low energy but predator near then dodge
     // if high energy then try to reproduce
     // if high energy but predator near then dodge
     // if medium energy then eat or reproduce
     // if medium energy but predator near then eat

     // will parameter:
     // options : braveness, horniness
     // logic: * more braveness, more risks to take, if better vision range and speed
     //          more chances to survive and reproduce else less chances than normal
     //        * more horniness, more risk to reproduce, if medium or low energy then
     //        * reproduce over eat
     // if low energy and horniness then reproduce over eat
     // if low energy and predator near but braveness then eat over dodge
     // if high energy then try to reproduce
     // if high energy but predator but braveness then reproduce over dodge
     // if medium energy then eat or reproduce
     // if medium energy but predator near then eat


  }

  

  collectStats() {

    //Stats
    this.stats = {
      uid: this.uid,
      idx: this.idx,
      livingTime : this.livingTime,
      livingTimeLimit : this.livingTimeLimit,
      gender: this.gender,
      creatureType: this.creatureType,
      speed: this.speed,
      visionRange: this.visionRange,
      copulingDistance : this.copulingDistance,
      turningSpeed: this.turningSpeed,
      energy: this.energy,
      maxEnergy: this.maxEnergy,
      numBugEated: this.numBugEated,
      isDead: this.isDead,
      isBlind: this.isBlind,
      isDodging: this.isDodging,
      isCopuling: this.isCopuling,
      isFindingMate: this.isFindingMate,
      fertility: this.fertility,
    };

    return this.stats;

  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.sprite.x = x;
    this.sprite.y = y;
  }

  setDirection(direction) {
    this.direction = direction;
    this.sprite.direction = direction;
  }

  setCenterCoordinates() {
    this.sprite.centerX = this.sprite.x + this.sprite.width / 2;
    this.sprite.centerY = this.sprite.y + this.sprite.height / 2;
    this.sprite.halfWidth = this.sprite.width / 2;
    this.sprite.halfHeight = this.sprite.height / 2;
  }

  setSprite(sprite) {
    this.sprite = sprite;
  }

  setIdx(idx) {
    this.idx = idx;
    this.sprite.idx = idx;
  }

  /**
   * Apply Force (angle + direction + speed)
   */
  move() {
    this.sprite.rotation = -this.sprite.direction + Math.PI;
    let x = this.sprite.x + Math.sin(this.sprite.direction) * (this.speed); //* sprite.scale.y);
    let y = this.sprite.y + Math.cos(this.sprite.direction) * (this.speed);
    this.setPosition(x, y);
  }

  /**
   * 
   */
  consumeEnergy() {
    this.energy -= 0.2;

    if (this.energy <= 0) {
      this.isDead = true;
    }
  }

  addLivingTime() {
    this.livingTime += 0.1;

    if (this.livingTime > this.livingTimeLimit) {
      this.isDead = true;
      this.interruptCopuling();
    }
  }

  wrapContainer() {

  }

  addChildren(sonUid) {
    this.childrens.push(sonUid);
  }


  getCurrentMate() {
    return this.currenMate;
  }

  setCurrentMate(uid) {
    this.currenMate = uid;
    this.mates.push(uid);
  }

}
