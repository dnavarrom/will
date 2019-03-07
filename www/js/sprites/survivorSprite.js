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

    //this.sprite = new PIXI.Sprite.fromImage('/img/trail.png'),
    this.sprite = new PIXI.Sprite(PIXI.loader.resources["img/trail.png"].texture);
    this.appScreenWidth = opt.screenWidth;
    this.appScreenHeight = opt.screenHeight;
    this.idx = opt.i;
    this.isHumanControlled = (  opt.isHumanControlled && opt.isHumanControlled == true) ? true : false;

    this.setParameters();

    super.setBehavior();
  }

  setParameters() {
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(0.2);
    this.sprite.dudeBounds = super.getBounds();
    //this.sprite.tint = Constants.colors.BLUE;
    this.sprite.direction = Math.random() * Math.PI * 2;
    this.sprite.offset = Math.random() * 100;
    this.sprite.appScreenWidth = this.appScreenWidth;
    this.sprite.appScreenHeight = this.appScreenHeight;

    if (this.isHumanControlled) {
      this.sprite.tint = Constants.colors.YELLOW;
      this.sprite.filters = [new PIXI.filters.GlowFilter(5, 2, 1, Constants.colors.YELLOW, 0.5)];
    }
    else {
      this.sprite.filters = [new PIXI.filters.GlowFilter(5, 2, 1, Constants.colors.WHITE, 0.5)];
    }

    
  }
}
