class FoodSprite extends CustomSprite {

  constructor(opt) {
    super(opt);
    this.appScreenWidth;
    this.appScreenHeight;

    this.init(opt.screenWidth, opt.screenHeight, opt.i);
  }

  init(screenWidth, screenHeight, i) {

    let graphics = new PIXI.Graphics;
    graphics.beginFill(Constants.colors.LIGHTGREY);
    graphics.drawCircle(10, 10, 2);
    graphics.endFill();
    let texture = new PIXI.Texture(app.renderer.generateTexture(graphics));
    this.sprite = new PIXI.Sprite(texture);
    //this.sprite = new PIXI.Sprite.fromImage('/img/star.png', true),
    //this.sprite = new PIXI.Sprite(PIXI.loader.resources["img/star.png"].texture)
    this.appScreenWidth = screenWidth;
    this.appScreenHeight = screenHeight;
    this.idx = i;
    this.sprite.idx = i;
    this.uid = helper.generateGuid();
    this.sprite.uid = this.uid;
    this.setParameters();
  };

  setParameters() {

    // set the anchor point so the texture is centerd on the sprite
    this.sprite.anchor.set(0.5);
    // scale png file
    //this.sprite.scale.set(0.05);
    this.sprite.scale.set(1);

    this.sprite.x = Math.random() * (this.appScreenWidth - 50);
    this.sprite.y = Math.random() * (this.appScreenHeight - 50);

    // create a random direction in radians
    this.sprite.direction = Math.random() * Math.PI * 2;
    this.sprite.turningSpeed = Math.random() - 0.8;
    //this.sprite.speed = (10 + Math.random() * 15) * 0.2;
    this.sprite.speed = (10 + Math.random() * 15) * 0.02;

    this.sprite.foodBounds = this.getBounds();
    
    this.sprite.offset = Math.random() * 100;
    this.sprite.appScreenWidth = this.appScreenWidth;
    this.sprite.appScreenHeight = this.appScreenHeight;
  };

  getBounds() {

    let foodBoundsPadding = 200;
    foodBounds = new PIXI.Rectangle(
      -foodBoundsPadding,
      -foodBoundsPadding,
      (this.appScreenWidth - 50) + foodBoundsPadding * 2,
      (this.appScreenHeight - 50) + foodBoundsPadding * 2
    );

    return foodBounds;
  }

}
