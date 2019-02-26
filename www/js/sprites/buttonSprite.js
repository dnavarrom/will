/* eslint-disable */
class Button extends CustomSprite {

  constructor(opt) {
    super(opt);

    this.x = opt.x;
    this.y = opt.y;
    this.buttonWidth = opt.width;
    this.buttonHeight = opt.height;
    this.radius = opt.radius;
    this.init(opt.buttonType);

    this.name = opt.name; //buttonId
    this.event = opt.event; //execution - purpose
    this.eventFunction = opt.eventFunction;

    this.eventListeners = {
      'click': [],
      'tap': [],
      'pointerDown': [],
      'pointerUp': []
    }

  }

  addEventListener(eventName, callback) {
    this.eventListeners[eventName].push(callback);
  }

  clearEventListener(eventName) {
    this.eventListeners[eventName] = [];
  }

  circleButton(gfx) {
    gfx.beginFill(Constants.button.buttonColor.mouseOut, 1);
    gfx.drawCircle(0, 0, this.radius);
    gfx.endFill();
    return gfx.generateCanvasTexture();
  }

  rectangleButton(gfx) {
    gfx.beginFill(Constants.button.buttonColor.mouseOut, 1);
    gfx.drawRoundedRect(0, 0, this.buttonWidth, this.buttonHeight, this.buttonHeight / 5);
    gfx.endFill();
    return gfx.generateCanvasTexture();
  }

  init(bt) {

    let gfx = new PIXI.Graphics();

    // generate the texture
    if (bt == Constants.button.buttonType.rectangleButton) {
      this.texture = this.rectangleButton(gfx);
    } else if (bt == Constants.button.buttonType.circleButton) {
      this.texture = this.circleButton(gfx);
    } else {
      console.log("ButtonType not defined, using default rectangle button");
      this.texture = this.rectangleButton(gfx);
    }

    // set the x, y and anchor
    //this.x = x;
    //this.y = y;
    this.anchor.x = 0.5;
    this.anchor.y = 0.5;

    // create the text object

    this.text = new PIXI.Text("", 'arial');
    this.text.anchor = new PIXI.Point(0.5, 0.5);

    this.addChild(this.text);

    this.setBehavior();

  }

  setBehavior() {

    // set the interactivity to true and assign callback functions
    this.interactive = true;

    this.on("click", function() {
      this.tint = Constants.button.buttonColor.click;
    });

    this.on("tap", function() {
      //console.log("tap");
    });

    this.on("pointerdown", function() {
      this.isdown = true;
      this.tint = Constants.button.buttonColor.click;

      this.addEventListener("pointerUp", {
        isOver: this.isOver,
        isdown: this.isdown
      });

    });

    this.on("pointerup", function() {
      this.isdown = false;
      if (this.isOver) {
        this.tint = Constants.button.buttonColor.mouseOver;
      } else {
        this.tint = Constants.button.buttonColor.mouseOut;
      }
    });

    this.on("pointerover", function() {
      this.isOver = true;
      if (this.isdown) {
        return;
      }
      this.tint = Constants.button.buttonColor.mouseOver;
    });

    this.on("pointerout", function() {
      //console.log("pointerout");

      this.isOver = false;
      if (this.isdown) {
        return;
      }
      this.tint = Constants.button.buttonColor.mouseOut;
    });

  }

  setText(val, style) {

    // Set text to be the value passed as a parameter
    this.text.text = val;
    // Set style of text to the style passed as a parameter
    if (style) {
      this.text.style = style;
    } else {
      this.text.style = new PIXI.TextStyle({
        fontFamily: 'Arial', // Font Family
        fontSize: 18, // Font Size
        //fontStyle: 'italic',// Font Style
        fontWeight: 'bold', // Font Weight
        //fill: ['#ffffff', '#F8A9F9'], // gradient
        fill: ['#ffffff', '#F8A9F9'], // gradient
        //stroke: '#4a1850',
        //strokeThickness: 5,
        //dropShadow: true,
        //dropShadowColor: '#000000',
        //dropShadowBlur: 4,
        //dropShadowAngle: Math.PI / 6,
        //dropShadowDistance: 6,
        //wordWrap: true,
        //wordWrapWidth: 150
      });
    }

  }

}
