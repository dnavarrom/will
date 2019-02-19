class DeviceRotation {
  constructor(app) {

    this.rotateText = new PIXI.Text('Please rotate your device', {
      align: 'center',
      fill: 'rgba(255, 255, 255, .9)',
      fontSize: 30,
      fontWeight: 100,
      fontFamily: 'FuturaICG, Roboto, Tahoma, Geneva, sans-serif',
      letterSpacing: 5
    });

    this.rotateScreen = new PIXI.Sprite(PIXI.loader.resources["img/icons/rotate-screen-48.png"].texture);
    this.rotateScreen.anchor.set(0.5); //center texture to sprite
    this.rotateScreen.scale.set(1);
    //this.rotateScreen.tint = Constants.colors.BLUE;

    this.setPosition(app.screen.width, app.screen.height);

    app.stage.addChild(this.rotateText);
    app.stage.addChild(this.rotateScreen);

  }

  setPosition(width, height) {
    this.rotateText.x = width / 2 - this.rotateText.width / 2;
    this.rotateText.y = height / 2 + 100;

    this.rotateScreen.x = width / 2;
    this.rotateScreen.y = height / 2;
  }

  showScene() {
    this.rotateText.alpha = 0.9;
    this.rotateScreen.alpha = 0.9;
  }

  hideScene() {
    this.rotateText.alpha = 0;
    this.rotateScreen.alpha = 0;
  }

  removeScene(app) {
    app.stage.removeChild(this.rotateText);
    app.stage.removeChild(this.rotateScreen);
  }
}
