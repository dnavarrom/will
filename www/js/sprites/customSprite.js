class CustomSprite extends PIXI.Sprite {
  constructor(opt) {
    super();
    this.appScreenWidth = opt.screenWidth;
    this.appScreenHeight = opt.screenHeight;
  }

  getSprite() {
    return this.sprite;
  }

  setBehavior() {

    this.sprite.handleBorderCollition = function() {

      //si el worm choca con los limites lo dirijo hacia otro lado
      let evalSprite = {
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height
      };

      let borderX = this.x; // + sprite.width;
      let borderY = this.y; // + sprite.height;

      let direction = this.direction;
      let collission = false;

      //console.log("X: " + borderX + ", Y: " + borderY);

      if (borderX >= this.appScreenWidth - 10 || borderX <= 10) {

        collission = true;
        //console.log("COLISSION X at " + borderX + "," + borderY);
      }

      if (borderY >= this.appScreenHeight || borderY <= 10) {
        collission = true;
        //console.log("COLISSION Y at " + borderX + "," + borderY);
      }

      if (collission) {
        direction = helper.CheckDistanceBetweenSprites(evalSprite, {
            x: this.appScreenWidth / 2,
            y: this.appScreenHeight / 2
          })
          .angle;
      }

      return direction;
    };

  }

  getBounds() {
    let dudeBoundsPadding = 150;
    return new PIXI.Rectangle(
      -dudeBoundsPadding,
      -dudeBoundsPadding,
      this.appScreenWidth + dudeBoundsPadding * 2,
      this.appScreenHeight + dudeBoundsPadding * 2);
  }
}
