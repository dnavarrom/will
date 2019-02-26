const SpriteFactory = {

  registeredTypes: new Map(),

  register(classname, classPrototype) {
    if (!SpriteFactory.registeredTypes.has(classname) &&
      classPrototype.prototype instanceof CustomSprite) {
      SpriteFactory.registeredTypes.set(classname, classPrototype);
    } else {
      console.error(classname + " is not instance of CustomSprite");
    }
  },

  create(classname, opt) {
    if (!SpriteFactory.registeredTypes.has(classname)) {
      console.error(classname + " not registered, use register method first ");
      return null;
    }

    let cl = SpriteFactory.registeredTypes.get(classname);
    let instance = new cl(opt);
    return instance;
  }
}
