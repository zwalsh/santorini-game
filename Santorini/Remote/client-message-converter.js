/*
  This module provides functions for converting JSON network messages
  sent and received by the client side to internal data representations
  and objects, and vice versa.

  ========== Data Definitions ==========

  Internal:
  - Board
  - Worker
  - Turn
  - InitWorker
  - WorkerRequest
  - GameResult


  JSON:
  - JsonWorker is (Worker) ...
  - Cell is ...
  - Placement
  - WorkerPlace is ...
  - Coordinate is ...
  - Action is ...
  - EncounterOutcome is ...

 */

// ================= X to JSON ==================

/* PlaceRequest -> Place

 */
function placeRequestToJson(placeRequest) {

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

*/
function jsonToInitWorkerList(initWorkerList) {

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

*/
function jsonToGameResults(gameResults) {

}


module.exports = {
  'placeRequestToJson': placeRequestToJson,
  'turnToJson': turnToJson,
  'jsonToBoard': jsonToBoard,
  'jsonToWorkerRequest': jsonToWorkerRequest,
  'jsonToInitWorkerList': jsonToInitWorkerList,
  'jsonToGameResults': jsonToGameResults,
}