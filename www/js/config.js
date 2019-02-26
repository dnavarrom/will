/* eslint-disable */
var config = {
  app: {
    width: 800,
    height: 600,
    autoSize: true,
    visual: {
      bgcolor: "0X022a31"
    }
  },
  world: {
    food: 100,
    predators: 1,
    survivors: 45,
    maxFoodGenerationRatio: 50,
    foodRegenerationThreshold: 0.15, // % of max food to regenerate food
    maxFood: 150,
    maxSurvivors: 90,
    maxPredators: 3

  },
  evolution: {
    generationLimit: 10,
    geneticOperators: {
      crossoverProbabilityRate: 0.3,
      specificGeneCrossoverRate: 0.5,
      mutationProbabilityRate: 0.5,
      specificGeneMutationRate: 0.3
    }
  },
  creature: {
    adultAge: 5,
    elderAge: 10,
    livingTimeLimit: 15,
    minVisionRange: 50,
    maxVisionRange: 200,
    maxEnergy: 10
  },
  debugMode: false
}
