class InGameInformation {

  constructor(app) {

    //UI Information
    this.uiTextInfo = new PIXI.Text("TEST", {
      fontWeight: 'bold',
      //fontStyle: 'italic',
      fontSize: 17,
      //fontFamily: 'Arvo',
      fill: '#FFFFFF',
      align: 'center',
      //stroke: '#a4410e',
      strokeThickness: 2
    });

    //this.uiTextInfo.x = app.screen.width / 2;
    //this.uiTextInfo.y = app.screen.height - 30;
    this.setPosition(app.screen.width, app.screen.height);
    this.uiTextInfo.anchor.x = 0.5;
    this.hideScene();

    this.containers = {
      uiTextInfo: this.uiTextInfo
    }

    app.stage.addChild(this.uiTextInfo);

  }

  showScene() {
    /*
    for (var key in this.containers) {
      if (this.containers.hasOwnProperty(key)) {
        this.containers[key].visible = true;
      }
    }
    */
    this.uiTextInfo.visible = true;
  }

  hideScene() {
    /*
    for (var key in this.containers) {
      if (this.containers.hasOwnProperty(key)) {
        this.containers[key].visible = false;
      }
    }
    */

    this.uiTextInfo.visible = false;
  }

  updateUi(sprites, predators, food, iteration, generationNumber, generationStats, fps) {
    this.uiTextInfo.text = "Generation N° : " + generationNumber + " - Iteration N° : " + iteration +
      " - Best Generation Fitness : " + generationStats.BestFitness + " - [ #Food : " + food + " - #Survivors : " +
      sprites + " - #Predators: " + predators + " ] - FPS : " + Math.round(fps);
  }

  setPosition(width, height) {

    this.uiTextInfo.x = width / 2;
    this.uiTextInfo.y = height - 30;

  }
}
