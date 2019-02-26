const EventHandler = {

  registeredEventHandlers: {},
  registeredEventActions: new Map(),

  registerEventHandler(eventType, origin, callback) {
    let eventDefinition = {
      executed: false,
      origin: origin,
      callbackFunction: callback
    };

    found = false;

    if (this.registeredEventHandlers[eventType] == null || this.registeredEventHandlers[eventType] == 'undefined') {
      this.registeredEventHandlers[eventType] = [];
      this.registeredEventHandlers[eventType].push(eventDefinition);
    } else {
      for (let i = 0; i < this.registeredEventHandlers[eventType].length; i++) {
        if (this.registeredEventHandlers[eventType][i].origin == origin) {
          this.registeredEventHandlers[eventType][i] = eventDefinition;
          found = true;
        }
      }

      if (!found) {
        this.registeredEventHandlers[eventType].push(eventDefinition);
      }

    }
  },

  getEventHandler(eventType) {
    if (!eventType)
      return this.registeredEventHandlers;
    else
      return this.registeredEventHandlers[eventType];
  },

  validateEventType(eventType) {
    if (this.registeredEventHandlers[eventType] == null ||
      this.registeredEventHandlers[eventType] == "undefined") {
      console.log("eventHandler.js : event [" + eventType + "] not registered");
      return false;
    }
    return true;
  },

  setEventOrigin(eventType, origin) {

    if (!this.validateEventType(eventType))
      return;

    for (let i = 0; i < this.registeredEventHandlers[eventType].length; i++) {
      this.registeredEventHandlers[eventType][i].origin = origin;
      this.registeredEventHandlers[eventType][i].executed = false;
    }
  },

  setEventStatus(eventType, status) {
    if (!this.validateEventType(eventType))
      return;

    for (let i = 0; i < this.registeredEventHandlers[eventType].length; i++) {
      this.registeredEventHandlers[eventType][i].executed = status;
    }
  },

  setCallbackFunction(eventType, origin, callback) {
    if (!this.validateEventType(eventType))
      return;

    for (let i = 0; i < this.registeredEventHandlers[eventType].length; i++) {
      if (this.registeredEventHandlers[eventType][i].origin == origin) {
        this.registeredEventHandlers[eventType][i].callbackFunction = callback;
      }
    }
  },

  execute(eventType, origin, data) {
    if (!this.validateEventType(eventType))
      return;

    for (let i = 0; i < this.registeredEventHandlers[eventType].length; i++) {
      if (this.registeredEventHandlers[eventType][i].origin == origin) {
        if (typeof(this.registeredEventHandlers[eventType][i].callbackFunction) === "function") {
          if (this.registeredEventHandlers[eventType][i].executed == false) {
            this.registeredEventHandlers[eventType][i].executed = true;
            return this.registeredEventHandlers[eventType][i].callbackFunction(data);
          }
        } else {
          console.log("EventType : " + eventType + "[" + origin + "].callbackfunction is not a function");
        }
      }
    }
  }

}
