# behavior
- Add food limit (now is infinite)
- Add survivor limit (now is infinite)
- include turning speed operator (not used today)
- include braveness for survivors
- include elitism factor (in chromosome)
- survivors want to reproduce when they are not eating or escaping


#new stuffs
- show stats of each survivor when keypress 
+ Show vision range toogle (spacebar) 
- show stats of specific survivor (mouse click)
- add will model
- add complexity to the world (and a brain for each creature)
- add bird flock behavior based on dna compatibility
- add creatures visual relations viewer (parents, childrens, best performers, fuckers) (lines / colors don't know)
- add intro and basic info
- add background music
- add particle effects when someone is fucking

# bugs
+ Fixed - new childrens are not shown in scene  (ok)
- 

#refactor
+ Add Predator to factory (ok)
+ Add SpriteFactory (ok)
+ Add Food class to factory(ok)
+ Add Survivor class to factory (ok)
+ improve fps when 50+ survivors are on screen (ok)
+ Repair predator eat logic when survivor is dead (ok)
- Bundle .js using webpack
- extend Background scrolling loop (ok - testing)
- allow resize world in browser
- detect mobile browser
- review CustomSprite superclass (empty class)
