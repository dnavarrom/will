class PredatorSprite extends CustomSprite {

  constructor(opt) {
    super(opt);
    this.appScreenWidth;
    this.appScreenHeight;
    this.init(opt);
  }

  init(opt) {
    this.sprite = new PIXI.Sprite.fromImage('/img/predator.png');
    this.appScreenWidth = opt.screenWidth;
    this.appScreenHeight = opt.screenHeight;
    this.setParameters();
    this.setBehavior();
    this.idx = opt.i;
    return this.sprite;
  };

  setParameters() {
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(0.8 + Math.random() * 0.3);
    this.sprite.dudeBounds = this.getBounds();
    this.sprite.tint = Constants.colors.WHITE;
    this.sprite.direction = Math.random() * Math.PI * 2;
    this.sprite.offset = Math.random() * 100;
    this.sprite.appScreenWidth = this.appScreenWidth;
    this.sprite.appScreenHeight = this.appScreenHeight;
  };

  setBehavior() {

    this.sprite.handleBorderCollition = function() {

      //si el worm choca con los limites lo dirijo hacia otro lado
      let evalSprite = {
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height
      }

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
    }

  };

  getBounds() {
    let dudeBoundsPadding = 150;
    return new PIXI.Rectangle(
      -dudeBoundsPadding,
      -dudeBoundsPadding,
      this.appScreenWidth + dudeBoundsPadding * 2,
      this.appScreenHeight + dudeBoundsPadding * 2);
  };

}
