/* eslint-disable */
var config = {
  app: {
    width: 1024,
    height: 768,
    visual: {
      bgcolor: "0X022a31"
    }
  },
  world: {
    food: 30,
    predators: 1,
    survivors: 15,
    maxFoodGenerationRatio: 10
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
    adultAge: 2,
    elderAge: 5,
    livingTimeLimit: 6

  }

}
