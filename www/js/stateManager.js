class StateManager {

    constructor(opt) {
        this.currentState = Constants.simulationStates.STOPPED;
        this.lastState = Constants.simulationStates.STOPPED;
    }

    setState(state) {
        this.lastState = this.currentState;
        this.currentState = state;
    }

    getCurrentState() {
        return this.currentState;
    }

    getLastState() {
        return this.lastState;
    }

}