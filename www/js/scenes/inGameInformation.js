class InGameInformation {

  constructor(app) {

    

    this.containers = {
      debugContainer: this.debugContainer,
      targetMateLineContainer: this.targetMateLineContainer
    }

  }

  
  showScene() {
    this.targetMateLineContainer.alpha = 0.7;
    this.debugContainer.alpha = 0.7;
  }

  hideScene() {
    this.targetMateLineContainer.alpha = 0;
    this.debugContainer.alpha = 0;
  }
}
