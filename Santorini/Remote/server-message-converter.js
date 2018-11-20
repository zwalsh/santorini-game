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
  - A PlayingAs is a ["playing-as", Name], where Name is a lowercase alphabetic string
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

const constants = require('../Common/constants');

// ================= X to JSON ==================

/* String -> PlayingAs
  Wrap the name in a PlayingAs
 */
function nameToJson(name) {
  return [constants.Message.PLAYING_AS, name];
}

/* [InitWorker, ...] -> Placement
  Convert the list of InitWorkers to a corresponding list of WorkerPlace
*/
function initWorkerListToJson(initWorkerList) {
  let placement = [];
  let playerToWorkerId = new Map();
  for (let initWorker of initWorkerList) {
    let player = initWorker.player;
    let currentWorkerId = playerToWorkerId.get(player);
    if (!currentWorkerId) {
      currentWorkerId = 1;
    }
    let workerPlace = initWorkerToWorkerPlace(initWorker, currentWorkerId);
    playerToWorkerId.set(player, currentWorkerId + 1);
    placement.push(workerPlace);
  }
  return placement;
}

/* InitWorker -> WorkerPlace
  Convert the given InitWorker to a WorkerPlace with the same Worker and Coordinates
*/
function initWorkerToWorkerPlace(initWorker, workerId) {
  return [initWorker.player + workerId, initWorker.x, initWorker.y];
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
  Produce the JSON representation of the list of GameResults.
*/
function gameResultsToJson(gameResults) {
  let encounterOutcomes = [];
  for (let gameResult of gameResults) {
    let eo = [gameResult.winner, gameResult.loser];
    if (gameResult.reason === constants.EndGameReason.BROKEN_RULE) {
      eo.push(constants.Message.ENCOUNTER_OUTCOME_IRREGULAR);
    }
    encounterOutcomes.push(eo);
  }
  return encounterOutcomes;
}

// ================= JSON to X ==================

/* Place -> PlaceRequest
  String is player's name
 */
function jsonToPlaceRequest(place) {
  return ["place", place[0], place[1]];
}

/* Action -> Turn
  (does not need to support string Actions for now)
 */
function jsonToTurn(action) {
  let workerRequest = jsonToWorkerRequest(action[0]);
  let moveDir = [action[1], action[2]];
  let moveRequest = ['move', workerRequest, moveDir];
  let turn = [moveRequest];
  if (action.length === 5) {
    let buildDir = [action[3], action[4]];
    let buildRequest = ['build', buildDir];
    turn.push(buildRequest);
  }
  return turn;
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
  'nameToJson': nameToJson,
  'boardToJson': boardToJson,
  'initWorkerListToJson':  initWorkerListToJson,
  'gameResultsToJson': gameResultsToJson,
  'jsonToTurn': jsonToTurn,
  'jsonToPlaceRequest': jsonToPlaceRequest,
  'jsonToWorkerRequest': jsonToWorkerRequest,
};