# behavior
- include turning speed operator (not used today)
- include braveness for survivors
- include elitism factor (in chromosome)
+ survivors want to reproduce when they are not eating or escaping (ok)
- improve survivor escape mechanism (today just escape in random direction)
- 


#new stuffs
+ show stats of each survivor when keypress (ok)
+ Show vision range toogle (spacebar) (ok)
- show stats of specific survivor (mouse click)
- add improved will model
- add complexity to the world (and a brain for each creature)
- add bird flock behavior for some creatures (dna based)
+ add creatures visual relations viewer (parents, childrens, best performers, fuckers) (lines / colors don't know) - work in progress (just parent relations)
+ add intro and basic info 
+ add splash screen
- add background music
- add particle effects when someone is reproducing
+ ok Add food limit (now is infinite) (ok)
+ Add survivor limit (now is infinite) (ok)
+ add maxEnergy / maxSpeed operators at config (ok)

#if it is finally a game
- add the posibility to control one creature, name it, select parameters
- add joypad functionality for phone
- Enable family control - control multiple creatures
- if creature is human controlled, change color, add hud stats and show childrens
- apply flow model to adjusts difficulty


# bugs
+ Fixed - new childrens are not shown in scene  (ok)
+ review visionRange visualization, seems to change after survivor killing (ok)
+ remove borders on browser (ok) - add style tag.
+ crash when change orientation from world scene (landscape to portrait)
+ rotateScreen scene not centered when change orientation from landscape to portrait
- creatures bugged (flickering) when trying to eat food (sometimes). Maybe conflict in findMate/findFood/escape behavior


#refactor
+ Add Predator to factory (ok)
+ Add SpriteFactory (ok)
+ Add Food class to factory(ok)
+ Add Survivor class to factory (ok)
+ improve fps when 50+ survivors are on screen (ok)
+ Repair predator eat logic when survivor is dead (ok)
- Bundle .js using webpack
+ extend Background scrolling loop (ok - testing)
+ allow resize world in browser (ok)
+ detect mobile browser (ok - using isMobile.js library)
- review CustomSprite superclass (empty class)
+ imlement pixi.loader and textureCache (ok)
+ add scenes (deviceRotation, splash, world] (ok)
+ translate world logig from main to world class (ok)
+ translate in-game information (hud) to inGameInformation class
+ complete implementation of state-machine (stateManager class)

