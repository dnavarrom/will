const CreatureFactory = {

  registeredTypes: new Map(),

  register(classname, classPrototype) {
    if (!CreatureFactory.registeredTypes.has(classname) &&
      classPrototype.prototype instanceof Creature) {
      CreatureFactory.registeredTypes.set(classname, classPrototype);
    } else {
      console.error(classname + " is not instance of Creature");
    }
  },

  create(classname, opt) {
    if (!CreatureFactory.registeredTypes.has(classname)) {
      console.error(classname + " not registered, use register method first ");
      return null;
    }

    let cl = CreatureFactory.registeredTypes.get(classname);
    let instance = new cl(opt);
    return instance;
  }
}
