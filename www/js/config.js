/* eslint-disable */
var config = {
  app: {
    width: 1024,
    height: 600,
    visual: {
      bgcolor: "0X022a31"
    }
  },
  world: {
    food: 70,
    predators: 1,
    survivors: 25,
    maxFoodGenerationRatio: 25,
    maxFood : 150,
    maxSurvivors : 70,
    maxPredators : 3

  },
  evolution: {
    generationLimit: 10,
    geneticOperators : {
        crossoverProbabilityRate : 0.3,
        specificGeneCrossoverRate : 0.5,
        mutationProbabilityRate : 0.5,
        specificGeneMutationRate : 0.3
    }
  },
  creature: {
    adultAge: 3,
    elderAge: 7,
    livingTimeLimit: 10,
    minVisionRange : 50,
    maxVisionRange : 200,
    maxEnergy : 10
  },
  debugMode : false
}
