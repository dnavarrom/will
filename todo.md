# behavior
- include turning speed operator (not used today)
- include braveness for survivors
- include elitism factor (in chromosome)
- survivors want to reproduce when they are not eating or escaping
- improve survivor escape mechanism (today just escape in random direction)
- 


#new stuffs
- show stats of each survivor when keypress 
+ Show vision range toogle (spacebar) (ok)
- show stats of specific survivor (mouse click)
- add will model
- add complexity to the world (and a brain for each creature)
- add bird flock behavior based on dna compatibility
- add creatures visual relations viewer (parents, childrens, best performers, fuckers) (lines / colors don't know)
- add intro and basic info
- add background music
- add particle effects when someone is fucking
+ ok Add food limit (now is infinite) (ok)
+ Add survivor limit (now is infinite) (ok)
+ add maxEnergy / maxSpeed operators at config (ok)
- add the posibility to control one creature, name it, select parameters (turn this in a game?)
- add joypad functionality for phone (turn this in a game?) / how to control creature family 
- disable debug (enable as power up)
- if creature is human controlled, change color, add hud stats and show childrens
- enable children control for creature


# bugs
+ Fixed - new childrens are not shown in scene  (ok)
- review visionRange visualization, seems to change after survivor killing
+ remove borders on browser (ok) - add style tag.
- crash when change orientation from world scene (landscape to portrait)
- rotateScreen scene not centered when change orientation from landscape to portrait
- creatures bugged (flickering) when trying to eat food (sometimes). Maybe conflict in findMate/findFood/escape behavior



#refactor
+ Add Predator to factory (ok)
+ Add SpriteFactory (ok)
+ Add Food class to factory(ok)
+ Add Survivor class to factory (ok)
+ improve fps when 50+ survivors are on screen (ok)
+ Repair predator eat logic when survivor is dead (ok)
- Bundle .js using webpack
- extend Background scrolling loop (ok - testing)
+ allow resize world in browser (ok)
+ detect mobile browser (ok - using isMobile.js library)
- review CustomSprite superclass (empty class)
+ imlement pixi.loader and textureCache (ok)
+ add scenes (deviceRotation, splash, world] (ok)
+ translate world logig from main to world class (ok)
- translate in-game information (hud) to inGameInformation class
- complete implementation of state-machine (stateManager class)

