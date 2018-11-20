/*

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

module.exports = {
  'boardToJson': boardToJson,
  'initWorkerListToJson':  initWorkerListToJson,
  'gameResultsToJson': gameResultsToJson,
  'jsonToTurn': jsonToTurn,
  'jsonToPlaceRequest': jsonToPlaceRequest,
};