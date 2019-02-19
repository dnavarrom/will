class UiControls {

  constructor(app) {

    this.buttonAddCreature = new PIXI.Sprite(PIXI.loader.resources[
      "img/icons/baseline_add_circle_outline_white_48dp.png"].texture);
    this.buttonAddCreature.anchor.set(0.5); //center texture to sprite
    this.buttonAddCreature.scale.set(1);
    this.setPosition(app.screen.width, app.screen.height);
    this.buttonAddCreature.alpha = 0.4;
    app.stage.addChild(this.buttonAddCreature);
  }

  setPosition(width, height) {
    this.buttonAddCreature.x = width - this.buttonAddCreature.width / 2 - 100;
    this.buttonAddCreature.y = height - 100;

  }

  showScene() {
    this.buttonAddCreature.alpha = 0.3;
  }

  hideScene() {
    this.buttonAddCreature.alpha = 0;
  }
}
