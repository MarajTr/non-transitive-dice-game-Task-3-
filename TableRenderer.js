const Table = require("cli-table3");
const chalk = require("chalk").default;

class TableRenderer {
    static render(probabilities, diceSet) {
        const headers = ["User dice v", ...diceSet.map(die => die.values.join(","))].map(h => chalk.cyan(h));

        const table = new Table({
            head: headers.map(h => chalk.bold.cyan(h)), // Emphasize headers
            colWidths: Array(headers.length).fill(15)
        });

        for (let i = 0; i < diceSet.length; i++) {
            const row = [chalk.bold.magenta(diceSet[i].values.join(",")), ...probabilities[i]];
            table.push(row);
        }

        console.log(table.toString());
    }
}

module.exports = TableRenderer;
