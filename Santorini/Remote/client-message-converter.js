/*
  This module provides functions for converting JSON network messages
  sent and received by the client side to internal data representations
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

const Worker = require('../Common/worker');
const Board = require('../Common/board');
const GameResult = require('../Common/game-result');
const constants = require('../Common/constants');


// ================= X to JSON ==================

/* PlaceRequest -> Place
  Converts a PlaceRequest into the equivalent Place message.
*/
function placeRequestToJson(placeRequest) {
  return [placeRequest[1], placeRequest[2]];
}

/* Turn -> Action
  Convert the Turn data to an Action.
 */
function turnToJson(turn) {
  let move = turn[0];
  let worker = move[1].player + move[1].id;
  let jsonTurn = [worker].concat(move[2]);
  if (turn.length === 2) {
    let build = turn[1];
    jsonTurn = jsonTurn.concat(build[1]);
  }
  return jsonTurn;
}

// ================= JSON to X ==================

/* Placement -> [InitWorker, ...]
  Convert the received Placement into an InitWorkerList, with each
  WorkerPlace in the list converted to the equivalent InitWorker.
*/
function jsonToInitWorkerList(placement) {
  return placement.map(jsonToInitWorker);
}

/* WorkerPlace -> InitWorker
  Convert the given WorkerPlace into the equivalent InitWorker.
*/
function jsonToInitWorker(workerPlace) {
  let workerRequest = jsonToWorkerRequest(workerPlace[0]);
  return { player: workerRequest.player, x: workerPlace[1], y: workerPlace[2] };
}


/* [[Cell, ...] ...] -> Board
  Create a Board object from the given JSON representation.
*/
function jsonToBoard(boardSpec) {
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
}

/* [EncounterOutcome, ...] -> [GameResult, ...]
  Convert the list of EncounterOutcomes to an equivalent list of GameResults.
*/
function jsonToGameResults(encounterOutcomes) {
  return encounterOutcomes.map(jsonToGameResult);
}

/* EncounterOutcome -> GameResult
  Convert the given EncounterOutcome to the equivalent GameResult.
*/
function jsonToGameResult(encounterOutcome) {
  let endGameReason = encounterOutcome.length === 2 ? constants.EndGameReason.WON : constants.EndGameReason.BROKEN_RULE;
  return new GameResult(encounterOutcome[0], encounterOutcome[1], endGameReason);
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
  'placeRequestToJson': placeRequestToJson,
  'turnToJson': turnToJson,
  'jsonToBoard': jsonToBoard,
  'jsonToInitWorkerList': jsonToInitWorkerList,
  'jsonToGameResults': jsonToGameResults,
}