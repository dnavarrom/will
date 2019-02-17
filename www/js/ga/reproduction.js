/* eslint-disable */

class Reproduction
{
    
    constructor (parent1, parent2) {
        this.child = {
            speed : 0,
            visionRange : 0,
            turningSpeed : 0,
            maxEnergy : 0,
            fertility : 0,
            copulingDistance : 0,
            braveness : 0
        };

        this.parent1 = parent1;
        this.parent2 = parent2;
    }

    Evolve() {
        
        this.Crossover();
        
        if (Math.random() > config.evolution.geneticOperators.mutationProbabilityRate) {
            this.Mutate();
        }

        console.log("Child Chromosome");
        console.log(this.child);

        this.child.parent1Uid = this.parent1.uid;
        this.child.parent2Uid = this.parent2.uid;
        return this.child;

    }

    Crossover() {

        //speed
        if (Math.random() > config.evolution.geneticOperators.specificGeneCrossoverRate) {
            this.child.speed = this.parent1.speed;
        }
        else {
            this.child.speed = this.parent2.speed;
        }

        //visionRange
        if (Math.random() > config.evolution.geneticOperators.specificGeneCrossoverRate) {
            this.child.visionRange = this.parent1.visionRange;
        }
        else
        {
            this.child.visionRange = this.parent2.visionRange;
        }
        

        //turningSpeed
        if (Math.random() > config.evolution.geneticOperators.specificGeneCrossoverRate) {
            this.child.turningSpeed = this.parent1.turningSpeed;
        }
        else
        {
            this.child.turningSpeed = this.parent2.turningSpeed;
        }

        //energy
        if (Math.random() > config.evolution.geneticOperators.specificGeneCrossoverRate) {
            this.child.maxEnergy = this.parent1.maxEnergy;
        }
        else
        {
            this.child.maxEnergy = this.parent2.maxEnergy;
        }

        //Fertility
        if (Math.random() > config.evolution.geneticOperators.specificGeneCrossoverRate) {
            this.child.fertility = this.parent1.fertility;
        }
        else
        {
            this.child.fertility = this.parent2.fertility;
        }

        //Copuling Distance
        if (Math.random() > config.evolution.geneticOperators.specificGeneCrossoverRate) {
            this.child.copulingDistance = this.parent1.copulingDistance;
        }
        else
        {
            this.child.copulingDistance = this.parent2.copulingDistance;
        }

        //braveness
        if (Math.random() > config.evolution.geneticOperators.specificGeneCrossoverRate) {
            this.child.braveness = this.parent1.braveness;
        }
        else
        {
            this.child.braveness = this.parent2.braveness;
        }
    }

    Mutate() {
        let go = config.evolution.geneticOperators;
        this.child.speed === Math.random() < go.specificGeneMutationRate ? (2 + Math.random() * 2) * 0.2 : this.child.speed;
        this.child.visionRange === Math.random() < go.specificGeneMutationRate ? helper.generateRandomInteger(50,100) : this.child.visionRange;
        this.child.turningSpeed === Math.random() < go.specificGeneMutationRate ? Math.abs(Math.random(1) - 0.8) : this.child.turningSpeed;
        this.child.maxEnergy === Math.random() < go.specificGeneMutationRate ? helper.generateRandomInteger(1,10) : this.child.maxEnergy;
        //TODO: why i'm not mutating fertility?
        this.child.copulingDistance === Math.random() < go.specificGeneMutationRate ? helper.generateRandomInteger(10,50) : this.child.copulingDistance;
        this.child.braveness === Math.random() < go.specificGeneMutationRate ? Math.random(1) : this.child.braveness;
    }


}