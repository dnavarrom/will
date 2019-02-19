class StateManager {

  constructor(opt) {
    this.currentState = Constants.simulationStates.STOPPED;
    this.lastState = Constants.simulationStates.STOPPED;
    this.scenes = opt.scenes;
  }

  setState(state) {
    if (this.currentState != state) {
      this.lastState = this.currentState;
      this.currentState = state;

      switch (state) {
        case Constants.simulationStates.STOPPED:
          this.scenes.world.hideScene();
          this.scenes.splash.hideScene();
          this.scenes.rotation.hideScene();
          this.scenes.inGameInformation.hideScene();
          this.scenes.uiControls.hideScene();
          break;

        case Constants.simulationStates.RUN:
          this.scenes.world.showScene();
          this.scenes.splash.hideScene();
          this.scenes.rotation.hideScene();
          this.scenes.inGameInformation.showScene();
          this.scenes.uiControls.showScene();
          break;

        case Constants.simulationStates.ROTATION:
          this.scenes.world.hideScene();
          this.scenes.splash.hideScene();
          this.scenes.rotation.showScene();
          this.scenes.inGameInformation.hideScene();
          this.scenes.uiControls.hideScene();
          break;

        case Constants.simulationStates.SPLASH:
          this.scenes.world.hideScene();
          this.scenes.splash.showScene();
          this.scenes.rotation.hideScene();
          this.scenes.inGameInformation.hideScene();
          this.scenes.uiControls.hideScene();
          break;
      }

    }
  }

  getCurrentState() {
    return this.currentState;
  }

  getLastState() {
    return this.lastState;
  }

}
