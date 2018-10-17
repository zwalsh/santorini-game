const Rulechecker = require("../../Santorini/Common/rulechecker");
const utility = require("../../Santorini/Lib/utility");

const process = require('process');
let out = process.stdout;
process.stdin.setEncoding('utf8');

// Keep a buffer of given commands.
let commands = [];

// On inputs, parse the string to JSON and add them to the list of commands.
process.stdin.on('readable', () => {
  const chunk = process.stdin.read();
  if (chunk !== null) {
    commands = commands.concat(utility.jsonParser(chunk));
  }
});

// Once all commands have been received, see if the turn action was legal.
process.stdin.on('end', () => {
  let legal = commands.every((c) => {
    return parseCommand(c);
  });

  legal ? out.write(JSON.stringify("yes") + "\n") : out.write(JSON.stringify("no") + "\n");
});

let rulechecker = new Rulechecker();
// Mock Board for storing the game state
let board;

// If a move was legal, then the worker was moved and store it here for use by the subsequent build request.
let workerToUse = {};

// Dispatches inputted JSON commands to the appropriate adapter method.
// JSON -> Boolean
function parseCommand(json) {
  if (typeof json[0] !== 'string') {
    board = utility.parseBoard(json);

    return true;
  } else {

    let command = json[0];

    // TODO: This doesn't specify who's turn it is... how do we know what player sent the move?
    // Send data to the corresponding adapter function based on the given command.
    switch (command) {
      case 'move':
        // NOTE: This is a WorkerRequest
        workerToUse = utility.parseWorker(json[1]);
        let direction = json[2];
        // TODO: Spoof player and turn?
        // TODO We could take the player name from the Worker
        if (rulechecker.isValidMove(board, workerToUse, direction)) {
          board.moveWorker(workerToUse, direction);
          return true;
        } else return false;
      case '+build':
        return rulechecker.isValidBuild(board, workerToUse, json[1]);
      default:
        throw "Error: Invalid command";
    }
  }
}
