/*
  This module provides a strategy for placing Workers on the Board.

  Given a GameState, it gives the PlaceAction that would place a
  Worker as far as possible from all enemy Workers.
 */

const PlaceAction = require('./Action.js').PlaceAction;

/* GameState -> PlaceAction
   Provides a PlaceAction that will place the Worker as far as possible
   from the closest enemy Worker.

   If the Board is empty, it will place the Worker at [0,0]
 */
function choosePlacement(gameState) {
  let board = gameState.getBoard();
  let size = board.getSize();

  let thisPlayerId = gameState.getWhoseTurn();
  let opponentPlayerId = thisPlayerId === 0 ? 1 : 0;
  let opponentWorkers = gameState.getWorkerList(opponentPlayerId)
    .map(id => (board.getWorker(id)));

  // if it is our turn, and the opponent has no Workers, the Board must be empty
  if (opponentWorkers.length === 0) {
    return new PlaceAction([0, 0]);
  }

  let maximumDistance = 0;
  let bestLocation = null;

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (!board.isValidUnoccupiedLoc(row, col)) {
        continue;
      }
      let distance = minimumDistanceToLocations([row, col], opponentWorkers);
      if (distance > maximumDistance) {
        bestLocation = [row, col];
        maximumDistance = distance;
      }
    }
  }
  return new PlaceAction(bestLocation);
}

/* Location [Location] -> Number
  Finds the smallest distance between the given Location and any Location in the non-empty list.
 */
function minimumDistanceToLocations(location, locations) {
  let minimumDistance = null;
  for (let otherLoc of locations) {
    let dist = distance(location, otherLoc);
    if (minimumDistance === null || dist < minimumDistance) {
      minimumDistance = dist;
    }
  }
  return minimumDistance;
}

/* Location Location -> Number
  Returns the Pythagorean distance between two locations
 */
function distance(loc1, loc2) {
  let xDifference = loc1[0] - loc2[0];
  let yDifference = loc1[1] - loc2[1];
  return Math.sqrt(xDifference * xDifference + yDifference * yDifference);
}

module.exports = {
  "choosePlacement": choosePlacement
};
