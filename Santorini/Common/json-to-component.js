const Board = require('./board');
const Worker = require('./worker');
const nearley = require("nearley");
const grammar = require("../Lib/jsongrammar.js");
const constants = require('./constants');
let parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
var exports = module.exports = {};

/**
 * Data Definitions:
 *
 * A StringWorker is a: String that starts with the player name (string) and ends with a 1 or 2 - e.g. 'alfred1' or 'alfred2'
 *
 * A WorkerRequest is a: {player: string , id: int}
 *
 * A BoardSpec is a: [[Cell, ...], ... ]
 *
 * A Cell is one of:
 *  Height
 *  BuildingWorker
 *
 * Height (H) is a: int from 0 to 4 representing height
 *
 * A BuildingWorker is a: String that starts with a int(height), followed by a string player name,
 *                        and ends with a 1 or 2 - e.g. 'alfred1' or 'alfred2'
 *
 */

// Robust string-to-JSON parser, supporting multiple JSON inputs in nearly any format.
// If multiple JSON objects or arrays are submitted in one input, they are in order in the output list.
// String -> ListOfJSON
exports.jsonParser = function (input) {
  parser.feed(input.trim());
  if (parser.results.length !== 0) {
    let res = parser.results;
    parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    return res[0];
  }
};

// Returns a WorkerRequest given a StringWorker representation.
// StringWorker -> WorkerRequest
exports.parseWorker = function (worker) {
  let parsedWorker = worker.split(/[0-9]/);
  let player = parsedWorker[0];
  // TODO: needs to be changed if more than 9 workers allowed
  let id = parseInt(worker.substring(worker.length - 1));

  return {player: player, id: id};
}

// Returns a Board with Workers given a BoardSpec
// Converts Cells into board tiles and BuildingWorkers into Workers
// BoardSpec -> Board
exports.parseBoard = function (boardSpec) {
  let workerList = [];
  let initBoard = [];

  if (boardSpec.length < constants.BOARD_HEIGHT) {
    let initHeight = boardSpec.length;
    for (let i = 0; i < constants.BOARD_HEIGHT - initHeight; i++) {
      boardSpec.push([0,0,0,0,0,0]);
    }
  }

  boardSpec.forEach((r) => {
    if (r.length < constants.BOARD_WIDTH) {
      let initWidth = r.length;
      for (let i = 0; i < constants.BOARD_WIDTH - initWidth; i++) {
        r.push(0);
      }
    }
  })

  for (let i = 0; i < boardSpec.length; i++) {
    initBoard.push([]);
    for (let j = 0; j < boardSpec[i].length; j++) {
      if (typeof boardSpec[i][j] === 'number') {
        initBoard[i].push(boardSpec[i][j]);
      } else {
        // TODO: if the rules ever change to allow for more than 9 tiles or 9 workers, we need to change this.
        let height = parseInt(boardSpec[i][j].substring(0, 1));
        let player = boardSpec[i][j].substring(1, boardSpec[i][j].length - 1);
        let id = parseInt(boardSpec[i][j].substring(boardSpec[i][j].length - 1));

        // Swap i and j when making a Worker to conform with coordinate logic
        workerList.push(new Worker(j, i, id, player));
        initBoard[i].push(height);
      }
    }
  }

  return new Board(null, initBoard, workerList);
};