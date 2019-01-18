class SurvivorSprite extends CustomSprite {

  constructor(opt) {
    super(opt);
    this.appScreenWidth;
    this.appScreenHeight;
    this.init(opt);
  }

  init(opt) {

    /*
    let graphics = new PIXI.Graphics;
    graphics.beginFill(0xff22aa);
    graphics.drawCircle(40, 60, 17);
    graphics.drawCircle(10, 10, 10);
    graphics.endFill();
    let texture = new PIXI.Texture(app.renderer.generateTexture(graphics));

    this.sprite = new PIXI.Sprite(texture);
    this.appScreenWidth = screenWidth;
    this.appScreenHeight = screenHeight;
    this.setParameters();
    this.setBehavior();
    */

    this.sprite = new PIXI.Sprite.fromImage('/img/trail.png'),
      this.appScreenWidth = opt.screenWidth;
    this.appScreenHeight = opt.screenHeight;
    this.idx = opt.i;
    this.setParameters();
    this.setBehavior();
  }

  setParameters() {
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(0.2);
    this.sprite.dudeBounds = this.getBounds();
    //this.sprite.tint = Constants.colors.BLUE;
    this.sprite.direction = Math.random() * Math.PI * 2;
    this.sprite.offset = Math.random() * 100;
    this.sprite.appScreenWidth = this.appScreenWidth;
    this.sprite.appScreenHeight = this.appScreenHeight;
  }

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
