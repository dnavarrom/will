class PlayerInformation {

    constructor(app) {


        //Box

        this.graphics = new PIXI.Graphics();
        this.graphics.lineStyle(2, Constants.colors.LIGHTBLUE, 0.6);
        this.graphics.beginFill(Constants.colors.BLUEYALE, 0.15);
        this.graphics.drawRoundedRect(50, 50, 150, 90, 16);
        this.graphics.endFill();
     

  
      //UI Information
      this.uiTextInfo = new PIXI.Text("-- Player Status -- \n Score: 0 \n Age: 0 \n Childrens: 0", {
        fontWeight: 'normal',
        //fontStyle: 'italic',
        fontSize: 15,
        //fontFamily: 'Arvo',
        fill: '#FFFFFF',
        align: 'center',
        //stroke: '#a4410e',
        strokeThickness: 2
      });
  
      this.currentDisplay = {
        speed: -1,
        visionRange: -1,
        maxEnergy : -1,
        energy: -1,
        score : -1,
        childrens: -1,
        age : -1
      };
  
      //this.uiTextInfo.x = app.screen.width / 2;
      //this.uiTextInfo.y = app.screen.height - 30;
      this.setPosition(app.screen.width, app.screen.height);
      this.uiTextInfo.anchor.x = 0.5;
      this.hideScene();
  
      this.containers = {
        uiTextInfo: this.uiTextInfo
      }
  
      app.stage.addChild(this.uiTextInfo);
      app.stage.addChild(this.graphics);
  
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
      this.graphics.visible = true;
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
      this.graphics.visible = false;
    }

    isVisible() {
        return this.uiTextInfo.visible;
    }
  
    updateUi(data) {
  

        if (this.currentDisplay.score != data.numBugEated || this.currentDisplay.energy != data.energy) {


        this.currentDisplay.speed = data.speed;
        this.currentDisplay.maxEnergy = data.maxEnergy;
        this.currentDisplay.energy = data.energy;
        this.currentDisplay.score = data.numBugEated;
        this.currentDisplay.childrens = data.childrens.length;
        this.currentDisplay.age = data.livingTime;

        this.uiTextInfo.text = "-- Player Status -- \n Score: " + this.currentDisplay.score + " \n" +
                               "Age: " + helper.round(this.currentDisplay.age,2) + " \n " +
                               "Childrens: " + this.currentDisplay.childrens + " \n" + 
                               "Speed: " + this.currentDisplay.speed;

        }


    }
  
    setPosition(width, height) {
  
      this.uiTextInfo.x = width - width + 175;
      this.uiTextInfo.y = (height / 2) - 25;

      this.graphics.x = width - width + 50;
      this.graphics.y = height / 2 - 80 ;
  
    }
  }
  