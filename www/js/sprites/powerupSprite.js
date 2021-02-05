class PowerupSprite extends CustomSprite {

    constructor(opt) {
      super(opt);
      this.appScreenWidth;
      this.appScreenHeight;
      this.init(opt.screenWidth, opt.screenHeight, opt.i);
    }
  
    init(screenWidth, screenHeight, i) {

      //this.powerupEnergy = new PIXI.Sprite(PIXI.loader.resources["img/sprites/powerup/blue/frame1.png"].texture);
  
      let graphics = new PIXI.Graphics;
      
      let rnd = Math.random();

      if (rnd < 0.7) {
          // 0-70% Chance -- no entrego nada
          this.powerUpType = undefined;

      } else if (rnd < 0.8) {
          //1 - (70 to 80)% chance
          this.powerUpType = Constants.powerUpTypes.ENERGY;

      } else if (rnd < 0.95){
          //1 - (80 to 95)% chance
          this.powerUpType = Constants.powerUpTypes.SPEED;
      } else {
          //1- (95 to 100)%
          this.powerUpType = Constants.powerUpTypes.TELEPORT
      }


  
      if (this.powerUpType == undefined) {
        //By default, powerUps are disabled
        this.isEnabled = false;
        this.sprite = {
          isEnabled : false
        }
        return;
        }


      switch(this.powerUpType) {
        case Constants.powerUpTypes.ENERGY:
            graphics.beginFill(Constants.colors.GREEN);
            graphics.drawRect(10, 10, 5, 5);
            break;
  
        case Constants.powerUpTypes.SPEED:
          graphics.beginFill(Constants.colors.ORANGE);
          graphics.drawRect(10, 10, 5, 5);
            break;
  
        case Constants.powerUpTypes.TELEPORT:
          graphics.beginFill(Constants.colors.BLUE);
          graphics.drawRect(10, 10, 5, 5);
          break;
  
        default:
          graphics.beginFill(Constants.colors.BLACK);
          graphics.drawRect(10, 10, 5, 5);
          break;
      }
  
      graphics.endFill();
      let texture = new PIXI.Texture(app.renderer.generateTexture(graphics));
      this.sprite = new PIXI.Sprite(texture);
      //this.sprite = new PIXI.Sprite.fromImage('/img/star.png', true),
      //this.sprite = new PIXI.Sprite(PIXI.loader.resources["img/star.png"].texture)
      this.appScreenWidth = screenWidth;
      this.appScreenHeight = screenHeight;
      //this.idx = i;
      //this.sprite.idx = i;
      this.uid = helper.generateGuid();
      this.sprite.uid = this.uid;
      this.sprite.powerUpType = this.powerUpType;

      this.isEnabled = true;
      this.sprite.isEnabled = true;

      this.eated = false;
      this.sprite.eated = false;
    
      this.setParameters();
      super.setBehavior();


    };

    setIndex(idx) {
      this.idx = idx;
      this.sprite.idx = idx;
    }
  
    setParameters() {
  
      // set the anchor point so the texture is centerd on the sprite
      this.sprite.anchor.set(0.5);
      // scale png file
      //this.sprite.scale.set(0.05);
      this.sprite.scale.set(1);
  
      //TODO : change this for config.app.worldsize
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
    }
  
    getBounds() {
  
      let foodBoundsPadding = 200;
      let foodBounds = new PIXI.Rectangle(
        -foodBoundsPadding,
        -foodBoundsPadding,
        (this.appScreenWidth) + foodBoundsPadding * 2,
        (this.appScreenHeight) + foodBoundsPadding * 2
      );
  
      return foodBounds;
    }
  
  }
  