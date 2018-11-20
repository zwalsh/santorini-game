/*
  This module provides functions for converting JSON network messages
  sent and received by the server side to internal data representations
  and objects, and vice versa.

  ========== Data Definitions ==========

  Internal:
  - Board is defined in Common/board.js
  - Worker is defined in Common/worker.js
  - Turn is defined in Common/player-interface.js
  - InitWorker is defined in Common/board.js
  - GameResult is defined in Common/game-result.js

  JSON:
  - A Cell is defined in RuleCheckerHarness.js
  - A Placement is an array: [WorkerPlace, ...] of up to length 3, representing
    a list of already-placed Workers.
  - A WorkerPlace is a JSON array: [JsonWorker,Coordinate,Coordinate].
  - A JsonWorker is a String of the player's name followed by either
    a 1 or a 2, denoting which of the player's Workers it is.
  - A Coordinate is a natural number between 0 and 5 (inclusive).
  - An Action is either:
      - String, which represents the name of a player that is giving up;
      - [Worker,EastWest,NorthSouth], which represents a winning move; or
      - [Worker,EastWest,NorthSouth,EastWest,NorthSouth], which represents
         a request to move the specified worker and build in the specified
         directions. The first pair of directions specify the move, the
         second one the building step.
  - An EncounterOutcome is one of the following:
      - [String, String], which is the name of the winner followed by
        the loser;
      - [String, String, "irregular"], which is like the first
        alternative but signals that the losing player misbehaved.
*/


// ================= X to JSON ==================


/* [InitWorker, ...] -> Placement

*/
function initWorkerListToJson(initWorkerList) {

}

/* Board -> [[Cell, ...], ...]
  Convert a Board object to its JSON representation.
*/
function boardToJson(board) {
  let jsonBoard = [];
  let boardHeights = board.getBoard();
  let workers = board.getWorkers();
  for (let y = 0; y < boardHeights.length; y++) {
    let row = [];
    for (let x = 0; x < boardHeights.length; x++) {
      let workerAtSquare = workers.find((w) => { return w.posn.x === x && w.posn.y === y });
      if (workerAtSquare) {
        row.push(workerToJson(workerAtSquare, boardHeights[y][x]));
      } else {
        row.push(boardHeights[y][x]);
      }
    }
    jsonBoard.push(row);
  }
  return jsonBoard;
}

/* Worker Integer -> JSON
  Produces the JSON representation of a Worker as will be included in the JsonBoard,
  including the height of the cell that the Worker is on.
*/
function workerToJson(worker, height) {
  return height + worker.player + worker.id;
}

/* [GameResult, ...] -> [EncounterOutcome, ...]

*/
function gameResultsToJson(gameResults) {

}

// ================= JSON to X ==================

/* Place String-> PlaceRequest
  String is player's name
 */
function jsonToPlaceRequest(place, name) {

}

/* Action -> Turn
  (does not need to support string Actions for now)
 */
function jsonToTurn() {

}

/* Worker -> WorkerRequest
  Convert the string worker representation to a WorkerRequest
 */
function jsonToWorkerRequest(worker) {
  let parsedWorker = worker.split(/[0-9]/);
  let player = parsedWorker[0];
  let id = parseInt(worker.substring(worker.length - 1));

  return {player: player, id: id};
}

module.exports = {
  'boardToJson': boardToJson,
  'initWorkerListToJson':  initWorkerListToJson,
  'gameResultsToJson': gameResultsToJson,
  'jsonToTurn': jsonToTurn,
  'jsonToPlaceRequest': jsonToPlaceRequest,
  'jsonToWorkerRequest': jsonToWorkerRequest,
};