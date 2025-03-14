const readline = require("readline");
const Game = require("./Game");

function parseDiceInput(args) {
    return args.map(arg => {
        const numbers = arg.split(",").map(num => parseInt(num, 10));
        if (numbers.some(isNaN)) {
            
            console.error(`Error: Invalid dice input "${arg}". All values must be integers.`);
            console.log(`Example: node index.js "1,2,3,4,5,6" "2,2,4,4,9,9" "3,3,5,5,7,7"`);
            console.log(`=== Help & Game Instructions ===
                1. You and the computer each choose a dice set.
                2. The game is non-transitive, meaning no single dice is the best.`)
            process.exit(1);
        }
        if (numbers.length !== 6) {
            
            console.error(` Error: Dice "${arg}" must have exactly **six** integer values.`);
            console.log(`Example: node index.js "1,2,3,4,5,6" "2,2,4,4,9,9" "3,3,5,5,7,7"`);
            console.log(`=== Help & Game Instructions ===
                1. You and the computer each choose a dice set.
                2. The game is non-transitive, meaning no single dice is the best.`)
            process.exit(1);
        }
        return numbers;
    });
}

const diceSet = parseDiceInput(process.argv.slice(2));


if (diceSet.length < 3) {
    
    console.error(` Error: You must provide at least **three** dice.`);
    console.log(` Example: node index.js "1,2,3,4,5,6" "2,2,4,4,9,9" "3,3,5,5,7,7"`);
    console.log(`=== Help & Game Instructions ===
        1. You and the computer each choose a dice set.
        2. The game is non-transitive, meaning no single dice is the best.`)
    process.exit(1);
}


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


try {
    const game = new Game(diceSet, rl);
    game.play();
} catch (error) {
    console.error(` Error: ${error.message}`);
    process.exit(1);
}
