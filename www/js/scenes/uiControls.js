/* eslint-disable */
class UiControls {

  constructor(app) {

    this.buttons = [];

    this.AButton(); //Add Creature
    this.BButton(); //Show Energy
    this.CButton(); //Show Vision Range
    //this.DButton(); //Show Name

  }

  AButton() {

    let opt = {
      buttonType: Constants.button.buttonType.circleButton,
      x: app.screen.width - 100,
      y: app.screen.height - 50,
      width: 75,
      height: 75,
      radius: 25,
      name: "button-add-creature",
      event: "addCreature",
      eventFunction: function(world) {
        console.log("ButtonA Handler");
        world.initSurvivors(1);
      }
    }

    this.aButton = new Button(opt);

    this.aButton.setText("A");
    this.buttons.push(this.aButton);
    app.stage.addChild(this.aButton);

  }

  BButton() {

    let opt = {
      buttonType: Constants.button.buttonType.circleButton,
      x: app.screen.width - 100,
      y: app.screen.height - 110,
      width: 75,
      height: 75,
      radius: 25,
      name: "button-show-energy-bar",
      event: "showEnergyBar",
      eventFunction: function(world) {
        console.log("ButtonB Handler");
        world.showEnergyBarEventHandler();
      }
    }

    this.bButton = new Button(opt);
    this.bButton.setText("B");
    this.buttons.push(this.bButton);
    app.stage.addChild(this.bButton);
  }

  CButton() {

    let opt = {
      buttonType: Constants.button.buttonType.circleButton,
      x: app.screen.width - 100,
      y: app.screen.height - 170,
      width: 75,
      height: 75,
      radius: 25,
      name: "button-show-vision-range",
      event: "showVisionRange",
      eventFunction: function(world) {
        console.log("ButtonC Handler");
        world.showVisionRangeHandler();
      }
    }

    this.cButton = new Button(opt);
    this.cButton.setText("C");
    this.buttons.push(this.cButton);
    app.stage.addChild(this.cButton);
  }

  DButton() {

    let opt = {
      buttonType: Constants.button.buttonType.circleButton,
      x: app.screen.width - 100,
      y: app.screen.height - 230,
      width: 75,
      height: 75,
      radius: 25
    }

    this.dButton = new Button(opt);
    this.dButton.setText("D");
    app.stage.addChild(this.dButton);
  }

  processEvents(data) {
    this.handleButtonEvents(data);
  }

  handleButtonEvents(data) {
    for (let i = 0; i < this.buttons.length; i++) {
      let processed = [];
      for (const key in this.buttons[i].eventListeners) {
        //let values = this.buttons[i].eventListeners[key];
        for (let v in this.buttons[i].eventListeners[key]) {
          EventHandler.registerEventHandler(this.buttons[i].event, this.buttons[i].name, this.buttons[i].eventFunction);
          EventHandler.execute(this.buttons[i].event, this.buttons[i].name, data);
          processed.push(key);
        }
      }

      for (let j = 0; j < processed.length; j++) {
        this.buttons[i].clearEventListener(processed[j]);
      }
    }
  }

  showScene() {
    for (let b in this.buttons) {
      this.buttons[b].alpha = 0.5;
    }
  }

  hideScene() {
    for (let b in this.buttons) {
      this.buttons[b].alpha = 0;
    }
  }
}
