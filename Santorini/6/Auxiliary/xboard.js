const utility = require("../../Santorini/Lib/utility");

const process = require('process');
let out = process.stdout;
process.stdin.setEncoding('utf8');

process.stdin.on('readable', () => {
  const chunk = process.stdin.read();
  if (chunk !== null) {
    utility.jsonParser(chunk).forEach((c) => {
      parseCommand(c);
    });
  }
});

// DATA DEFINITION: TODO MOVE ELSEWHERE
// A Board is [[Cell, ...], ...].
// A Cell is one of:
//      Height
//      BuildingWorker
// A Height is one of: 0, 1, 2, 3, 4.
// A BuildingWorker is a String that starts with a single digit followed by
//      a Worker. The first digit represents the Height of the building.
// A (String)Worker is a string of lowercase letters that ends in either 1 or 2. The last digit indicates whether it is
//     the first or the second worker of a player. The lowercase letters are the name of the player that owns the worker.
// A Direction is [EastWest, NorthSouth]
// EastWest is one of:
//      "EAST" "PUT" "WEST"
// NorthSouth is one of:
//      "NORTH" "PUT" "SOUTH"
// A Posn is a {x: int, y: int}

let board;

// Dispatches inputted JSON commands to the appropriate adapter method.
// JSON -> Void
function parseCommand(json) {
  if (typeof json[0] !== 'string') {
    // We are given a board specification, so parse it.
    board = utility.parseBoard(json);
  } else {

    let command = json[0];
    // NOTE: This is a WorkerRequest
    let worker = utility.parseWorker(json[1]);
    let direction = json[2];

    // Send data to the corresponding adapter function based on the given command.
    switch (command) {
      case 'move':
        board.moveWorker(worker, direction);
        out.write(JSON.stringify([]) + "\n");
        break;
      case 'build':
        board.buildWithWorker(worker, direction);
        out.write(JSON.stringify([]) + "\n");
        break;
      case 'neighbors':
        board.workerHasNeighbor(worker, direction) ? out.write(JSON.stringify("yes") + "\n") : out.write(JSON.stringify("no") + "\n");
        break;
      case 'occupied?':
        board.workerNeighborIsOccupied(worker, direction) ? out.write(JSON.stringify("yes") + "\n") : out.write(JSON.stringify("no") + "\n");
        break;
      case 'height':
          out.write(JSON.stringify(board.workerNeighborHeight(worker, direction)) + "\n");
        break;
      default:
        throw "Error: Invalid command";
    }
  }
}