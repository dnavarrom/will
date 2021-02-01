/* eslint-disable */
class CursorSprite extends CustomSprite {

    constructor(opt) {
      super(opt);
  
      
      this.radius = opt.radius;
      this.uid = opt.uid; 
  
      this.init(opt);
  
    }
  
    init(opt) {
  
      let gfx = new PIXI.Graphics();
  
      // set the x, y and anchor
      this.x = opt.x;
      this.y = opt.y;
      this.anchor.set(0.5);
  
      switch (opt.selectionType) {
        case Constants.selectionTypes.RECTANGLE:
          throw new error ("Not implemented yet");
          break;
        case Constants.selectionTypes.CIRCLE:
          this.texture = this.circleSelection(gfx);
          break;
        default:
          console.log("SelectionType not defined, using default circle");
          this.texture = this.circleSelection(gfx);
      }
  
  
      
  
      // create the text object
  
      if (opt.hasText) {
        this.text = new PIXI.Text("", 'arial');
        this.text.anchor = new PIXI.Point(0.5, 0.5);
        this.addChild(this.text);
        this.setText(opt.text, null);
      }
  
  
    }
  
    circleSelection(gfx) {
      gfx.beginFill(Constants.colors.YELLOW, 0,3);
      gfx.lineStyle(1, Constants.colors.YELLOW, 1);
      gfx.drawCircle(this.x, this.y, this.radius);
      gfx.endFill();
      return gfx.generateTexture();
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
          fontSize: 10, // Font Size
          //fontStyle: 'italic',// Font Style
          //fontWeight: 'bold', // Font Weight
          fill: [Constants.colors.BLACK], // gradient
          //fill: ['#ffffff', '#F8A9F9'], // gradient
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
  