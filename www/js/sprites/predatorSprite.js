class PredatorSprite extends CustomSprite {

  constructor(opt) {
    super(opt);
    this.appScreenWidth;
    this.appScreenHeight;
    this.init(opt);
  }

  init(opt) {
    //this.sprite = new PIXI.Sprite.fromImage('/img/predator.png');
    this.sprite = new PIXI.Sprite(PIXI.loader.resources["img/predator.png"].texture)
    this.appScreenWidth = opt.screenWidth;
    this.appScreenHeight = opt.screenHeight;
    this.setParameters();
    super.setBehavior();
    this.idx = opt.i;
    return this.sprite;
  }

  setParameters() {
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(0.8 + Math.random() * 0.3);
    this.sprite.dudeBounds = this.getBounds();
    this.sprite.tint = Constants.colors.WHITE;
    this.sprite.direction = Math.random() * Math.PI * 2;
    this.sprite.offset = Math.random() * 100;
    this.sprite.appScreenWidth = this.appScreenWidth;
    this.sprite.appScreenHeight = this.appScreenHeight;
  }

}
