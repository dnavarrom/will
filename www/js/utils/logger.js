/* eslint-disable */

  
  class Logger {
    constructor() {
  
      this.debug = config.debugMode;
      console.log("Debug mode enabled by config");
    }

  
    log(src, message, opt) {
      let msg = "[" + src + "]" + JSON.stringify(message);
        console.log(msg);
    }
  }
  