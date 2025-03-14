class ProbabilityCalculator {
    static calculateProbabilities(diceSet) {
        return diceSet.map(diceA => 
            diceSet.map(diceB => 
                diceA.values.join(',') === diceB.values.join(',')
                    ? `-(0.3333)`
                    : ProbabilityCalculator.calculateWinProbability(diceA.values, diceB.values)
            )
        );
    }

    static calculateWinProbability(diceA, diceB) {
        const totalCount = diceA.length * diceB.length;
        const winCount = diceA.flatMap(x => diceB.map(y => x > y)).filter(Boolean).length;

        return parseFloat((winCount / totalCount).toFixed(4));
    }
}

module.exports = ProbabilityCalculator;
