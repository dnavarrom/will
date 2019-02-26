class EnergyBarSprite extends PIXI.Text {
  constructor(opt) {
    super("E: 100%", {
      fontWeight: 'bold',
      //fontStyle: 'italic',
      fontSize: 10,
      fontFamily: 'Arvo',
      fill: '#FFFFFF',
      align: 'left',
      //stroke: '#a4410e',
      strokeThickness: 1
    });

    this.appScreenWidth;
    this.appScreenHeight;
    this.init(opt);
  }

  init(opt) {

    this.appScreenWidth = opt.screenWidth;
    this.appScreenHeight = opt.screenHeight;
    this.text = helper.getEnergyBar(opt.survivor.collectStats()
      .energy);
    this.uid = opt.survivor.uid;
    this.x = opt.survivor.x;
    this.y = opt.survivor.y;
    this.visible = true;
    this.alpha = 1;
  }

  setEnergyBar(sprite) {
    this.uid = sprite.uid;
    this.x = sprite.x - 10;
    this.y = sprite.y - 20;
    this.text = helper.getEnergyBar(sprite.collectStats()
      .energy);
  }

  toggleEnergyBar() {
    this.visible = !this.visible;

    //TODO: solo para debug
    if (this.visible)
      this.alpha = 1;
    if (!this.visible)
      this.alpha = 1;
  }

}
