/* eslint-disable */
class UiControls {

  constructor(app) {

    this.buttons = [];

    this.AButton(); //Add Creature
    this.BButton(); //Show Energy
    this.CButton(); //Show Vision Range
    this.DButton(); //Show Lineage
    this.EButton(); //Add human controlled
    //this.FButton(); //Show Worse
    this.GButton(); //Add Predator

    this.buttonGroupPositionx = 100;
    this.buttonGroupPositiony = 150;

  }

  AButton() {

    let opt = {
      buttonType: Constants.button.buttonType.rectangleButton,
      x: app.screen.width - 100,
      y: app.screen.height / 2 - 65,
      width: 120,
      height: 25,
      radius: 25,
      name: "button-add-creature",
      event: "addCreature",
      eventFunction: function(world) {
        console.log("ButtonA Handler");
        world.initSurvivors(1);
      }
    }

    this.aButton = new Button(opt);

    this.aButton.setText("Add Creature");
    this.buttons.push(this.aButton);
    app.stage.addChild(this.aButton);

  }

  BButton() {

    let opt = {
      buttonType: Constants.button.buttonType.rectangleButton,
      x: app.screen.width - 100,
      y: app.screen.height / 2 + 5,
      width: 120,
      height: 25,
      radius: 25,
      name: "button-show-energy-bar",
      event: "showEnergyBar",
      eventFunction: function(world) {
        console.log("ButtonB Handler");
        world.showEnergyBarEventHandler();
      }
    }

    this.bButton = new Button(opt);
    this.bButton.setText("Show Energy Bar");
    this.buttons.push(this.bButton);
    app.stage.addChild(this.bButton);
  }

  CButton() {

    let opt = {
      buttonType: Constants.button.buttonType.rectangleButton,
      x: app.screen.width - 100,
      y: app.screen.height / 2 + 40,
      width: 120,
      height: 25,
      radius: 25,
      name: "button-show-vision-range",
      event: "showVisionRange",
      eventFunction: function(world) {
        console.log("ButtonC Handler");
        world.showVisionRangeHandler();
      }
    }

    this.cButton = new Button(opt);
    this.cButton.setText("Show Vision Range");
    this.buttons.push(this.cButton);
    app.stage.addChild(this.cButton);
  }

  DButton() {

    let opt = {
      buttonType: Constants.button.buttonType.rectangleButton,
      x: app.screen.width - 100,
      y: app.screen.height / 2 + 75,
      width: 120,
      height: 25,
      radius: 25
    }

    this.dButton = new Button(opt);
    this.dButton.setText("Show Lineage");
    this.buttons.push(this.dButton);
    app.stage.addChild(this.dButton);
  }

  EButton() {

    let opt = {
      buttonType: Constants.button.buttonType.rectangleButton,
      x: app.screen.width - 100,
      y: app.screen.height / 2 + 110,
      width: 120,
      height: 25,
      radius: 25,
      name: "button-spawn-human-controlled-creature",
      event: "spawnHumanControlledCreature",
      eventFunction: function(world) {
        world.spawnHumanControlledCreatureHandler();
      }
    }

    this.eButton = new Button(opt);
    this.eButton.setText("Spawn Human Controlled");
    this.buttons.push(this.eButton);
    app.stage.addChild(this.eButton);
  }

  FButton() {

    let opt = {
      buttonType: Constants.button.buttonType.rectangleButton,
      x: app.screen.width - 100,
      y: app.screen.height / 2 + 145,
      width: 120,
      height: 25,
      radius: 25
    }

    this.fButton = new Button(opt);
    this.fButton.setText("Show Worse Creature");
    this.buttons.push(this.fButton);
    app.stage.addChild(this.fButton);
  }

  GButton() {

    let opt = {
      buttonType: Constants.button.buttonType.rectangleButton,
      x: app.screen.width - 100,
      y: app.screen.height / 2 - 30,
      width: 120,
      height: 25,
      radius: 25,
      name: "button-add-predator",
      event: "addPredator",
      eventFunction: function(world) {
        world.initPredators(1);
      }
    }

    this.gButton = new Button(opt);
    this.gButton.setText("Add Predator");
    this.buttons.push(this.gButton);
    app.stage.addChild(this.gButton);
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
