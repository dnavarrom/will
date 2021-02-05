/* eslint-disable */
var config = {
  app: {
    width: 4000,
    height: 4000,
    autoSize: true,
    visual: {
      bgcolor: "0X022a31"
    },
    highendGPU : false //to enable / disable filters that affects FPS
  },
  world: {
    food: 300,
    predators: 3,
    survivors: 30,
    powerups: 5,
    maxFoodGenerationRatio: 150,
    maxPowerupGenerationRatio: 10,
    foodRegenerationThreshold: 0.15, // % of max food to regenerate food
    powerupRegenerationThreshold: 0.3,
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
    adultAge: 10,
    elderAge: 30,
    livingTimeLimit: 60,
    minVisionRange: 50,
    maxVisionRange: 200,
    maxEnergy: 10,
    maxSpeed: 1.5
  },
  debugMode: true
}
