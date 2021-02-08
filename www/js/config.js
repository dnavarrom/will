/* eslint-disable */
var config = {
  app: {
    width: 2000,
    height: 2000,
    autoSize: true,
    visual: {
      bgcolor: "0X022a31"
    },
    highendGPU : false //to enable / disable filters that affects FPS
  },
  world: {
    food: 150,
    predators: 3,
    survivors: 15,
    powerups: 10,
    maxFoodGenerationRatio: 50,
    maxPowerupGenerationRatio: 5,
    foodRegenerationThreshold: 0.15, // % of max food to regenerate food
    powerupRegenerationThreshold: 0.2,
    maxFood: 500,
    maxPowerups: 10,
    maxSurvivors: 100,
    maxSurvivorsGenerationRatio : 30,
    survivorsRegenerationThreshold : 0.30,
    maxPredators: 3

  },
  evolution: {
    generationLimit: 3,
    geneticOperators: {
      crossoverProbabilityRate: 0.3,
      specificGeneCrossoverRate: 0.5,
      mutationProbabilityRate: 0.5,
      specificGeneMutationRate: 0.3
    }
  },
  creature: {
    adultAge: 1,
    elderAge: 30,
    livingTimeLimit: 60,
    minVisionRange: 50,
    maxVisionRange: 200,
    maxEnergy: 10,
    maxSpeed: 1.5
  },
  debugMode: true
}
