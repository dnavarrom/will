class Predator extends Creature {
  constructor(opt) {
    super(opt);

    //Predator specific behavior

    this.numCrittersEated = 0;
    this.creatureType = Constants.creatureTypes.PREDATOR;
    this.livingTimeLimit = config.creature.livingTimeLimit * 3; //they live more

    this.collectStats();

  }

  /**
   * Find survivors to eat
   * @param {*} survivorsInfo array of survivors (attributes + sprite)
   */
  findSurvivors(survivorsInfo) {

    let nearestSurvivorUid;
    let nearestSurvivorDistance = 9000;
    let angle;
    let survivorFound = 0;

    for (let i = 0, len = survivorsInfo.length; i < len; i++) {
      let dist = helper.CheckDistanceBetweenSprites(this.sprite, survivorsInfo[i]);
      if (nearestSurvivorDistance > dist.distance) {
        if (dist.distance < this.sprite.visionRange &&
          !survivorsInfo[i].IsDead) {
          nearestSurvivorDistance = dist.distance;
          nearestSurvivorUid = survivorsInfo[i].uid;
          angle = dist.angle;
          survivorFound++;
        }
      }
    }

    if (survivorFound == 0) {
      this.sprite.isBlind = true;
    } else {
      this.sprite.nearestSurvivorDistance = nearestSurvivorDistance;
      this.sprite.nearestSurvivorUid = nearestSurvivorUid;
      this.setDirection(angle);
      this.sprite.isBlind = false;
    }
  }

  /**
   * When eat, add energy
   */
  eat() {
    this.numCrittersEatedEated++;
    this.energy += 1;
  }
}
