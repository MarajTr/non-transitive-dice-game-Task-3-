const ProbabilityCalculator = require("./ProbabilityCalculator");
const TableRenderer = require("./TableRenderer");
const HMACGenerator = require("./HMACGenerator");
const Dice = require("./Dice");

class Game {
    constructor(diceSet, rl) {
        this.validateDiceSet(diceSet);
        this.diceSet = diceSet.map(dice => new Dice(dice));
        this.hmacGenerator = new HMACGenerator();
        this.rl = rl;
        this.firstMoveSelection = null;
    }

    validateDiceSet(diceSet) {
        if (!Array.isArray(diceSet) || diceSet.length < 3) {
            throw new Error("Invalid dice configuration. You must provide at least three dice.");
        }
        diceSet.forEach((dice, index) => {
            if (!Array.isArray(dice) || dice.length !== 6 || !dice.every(Number.isInteger)) {
                throw new Error(`Dice ${index + 1} is invalid. Each die must have exactly six integer values.`);
            }
        });
    }

    showHelp(returnCallback) {
        console.log("\n=== Help & Game Instructions ===");
        console.log("1. You and the computer each choose a dice set.");
        console.log("2. The game is non-transitive, meaning no single dice is the best.");
        console.log("3. Below is the probability table showing your chances of winning.\n");

        const probabilities = ProbabilityCalculator.calculateProbabilities(this.diceSet);
        TableRenderer.render(probabilities, this.diceSet);

        console.log("\nPress Enter to return...");
        this.rl.once("line", returnCallback);
    }
    determineFirstMove(callback) {
        this.firstMoveSelection = Math.floor(Math.random() * 2).toString();
        this.hmacData = this.hmacGenerator.generateHMAC(this.firstMoveSelection);
    
        if (!this.hmacData || !this.hmacData.hmac || !this.hmacData.key) {
            throw new Error("HMAC generation failed!");
        }
    
        console.log("\nLet's determine who makes the first move.");
        console.log(`I selected a random value in the range 0..1 (HMAC=${this.hmacData.hmac}).`);
        console.log("Try to guess my selection.");
    
        this.promptUser(["0 - 0", "1 - 1", "X - exit", "? - help"], (userInput) => {
            if (userInput === "X") return this.exitGame();
            if (userInput === "?") return this.showHelp(() => this.determineFirstMove(callback));
            if (!["0", "1"].includes(userInput)) return this.determineFirstMove(callback);
    
            console.log(`My selection: ${this.firstMoveSelection} (KEY=${this.hmacData.key}).`);
            this.userGoesFirst = userInput === this.firstMoveSelection;
            console.log(this.userGoesFirst ? "You go first!" : "I go first!");
            callback();
        });
    }
    
    

    selectDice(callback) {
        this.userGoesFirst ? this.userSelectsDice(callback) : this.computerSelectsDice(callback);
    }

    userSelectsDice(callback) {
        console.log("Choose your dice:");
        this.diceSet.forEach((dice, index) => console.log(`${index} - ${dice.values.join(",")}`));
        this.promptUser(["X - exit", "? - help"], (answer) => {
            if (answer === "X") return this.exitGame();
            if (answer === "?") return this.showHelp(() => this.userSelectsDice(callback));
            
            const choice = parseInt(answer);
            if (isNaN(choice) || choice < 0 || choice >= this.diceSet.length) return this.userSelectsDice(callback);
            
            this.userDice = this.diceSet.splice(choice, 1)[0];
            this.computerDice = this.diceSet[0];
            console.log(`You chose ${this.userDice.values.join(",")}, I will use ${this.computerDice.values.join(",")}`);
            callback();
        });
    }

    computerSelectsDice(callback) {
        this.computerDice = this.diceSet.splice(Math.floor(Math.random() * this.diceSet.length), 1)[0];
        console.log(`I choose ${this.computerDice.values.join(",")}.`);
        this.userSelectsDice(callback);
    }
    rollDice(dice, callback) {
        const randomModulo = Math.floor(Math.random() * 6);
        this.hmacData = this.hmacGenerator.generateHMAC(randomModulo.toString());
    
        // Corrected log statement
        console.log(`HMAC=${this.hmacData.hmac}`);
    
        this.promptUser(["0 - 0", "1 - 1", "2 - 2", "3 - 3", "4 - 4", "5 - 5", "X - exit", "? - help"], (userInput) => {
            if (userInput === "X") return this.exitGame();
            if (userInput === "?") return this.showHelp(() => this.rollDice(dice, callback));
            
            const userNumber = parseInt(userInput);
            if (isNaN(userNumber) || userNumber < 0 || userNumber > 5) {
                console.log("Invalid input. Please choose a number between 0 and 5.");
                return this.rollDice(dice, callback);
            }
    
            console.log(`My number is ${randomModulo} (KEY=${this.hmacData.key}).`);
            console.log(`The result is ${randomModulo} + ${userNumber} = ${(randomModulo + userNumber) % 6} (mod 6).`);
    
            callback(dice.roll());
        });
    }
    

    playRound() {
        console.log("\nIt's time for my throw.");
        this.rollDice(this.computerDice, (computerRoll) => {
            console.log("\nIt's time for your throw.");
            this.rollDice(this.userDice, (userRoll) => {
                console.log(`\nFinal results: I rolled ${computerRoll}, you rolled ${userRoll}.`);
                console.log( userRoll > computerRoll ? `You win! (${userRoll} > ${computerRoll})`  : userRoll < computerRoll ? `I win! (${computerRoll} > ${userRoll})` : `It's a tie! (${userRoll} = ${computerRoll})`);
                this.exitGame();
            });
        });
    }

    play() {
        this.determineFirstMove(() => this.selectDice(() => this.playRound()));
    }

    exitGame() {
        console.log("Exiting the game. Goodbye!");
        this.rl.close();
        process.exit(0);
    }

    promptUser(options, callback) {
        console.log(options.join("\n"));
        this.rl.question("\nYour selection: ", (input) => callback(input.toUpperCase()));
    }
}

module.exports = Game;
