/*
This file represents a rule checker for a game of Santorini.

This file provides a single function that allows players and admins
to check if an action by a player is valid, given the state of the game
(which includes the state of the board and turn information).

A rule checker has no internal state of its own, so no class definition is necessary.

Data definitions:

Action is defined in Action.js
GameState is defined in GameState.js

*/

const Action = require('./Action.js');

const MAX_WORKERS_PER_PLAYER = 2;
const WINNING_HEIGHT = 3;

/* GameState Action PlayerId -> Boolean
Is the given Action valid to take in the current game state?
PlayerId must only be provided if validating a PlaceAction.
*/
function validate(gameState, action, playerId) {
  switch(action.getType()) {
    case Action.PLACE:
      return validatePlaceAction(gameState, action, playerId);
    case Action.MOVE:
      return validateMoveAction(gameState, action);
    case Action.BUILD:
      return validateBuildAction(gameState, action);
  }
}

/* GameState Action PlayerId -> Boolean
Checks if it is valid for the given Player to take the given PlaceAction under the given
GameState. This is allowed if:
  - it is the Player's turn
  - the Player owns fewer than the max allowable number of Workers
  - the location they are placing it on is empty
*/
function validatePlaceAction(gameState, action, playerId) {
  let board = gameState.getBoard();
  if (gameState.getWhoseTurn() !== playerId) {
    return false;
  }
  let playerWorkers = gameState.getWorkerList(playerId);
  if (playerWorkers.length >= MAX_WORKERS_PER_PLAYER) {
    return false;
  }
  if (board.getWorkers().length >= board.MAX_WORKERS) {
    return false;
  }
  let loc = action.getLoc();
  return board.isValidUnoccupiedLoc(loc[0], loc[1]);
}

/* GameState Action -> Boolean
Checks if it is valid for the given Player to take the given MoveAction under the given
GameState. This is allowed if:
  - the Worker being moved belongs to the Player whose turn it is
  - that Player did not just move a Worker
  - the Location the Worker is being moved to is:
    - adjacent to its current Location
    - less than one level higher than the current Location
    - less than the maximum height of the Board
    - on the Board and not occupied by another Worker
*/
function validateMoveAction(gameState, action) {
  let board = gameState.getBoard();
  let workerId = action.getWorkerId();
  if (gameState.getOwner(workerId) !== gameState.getWhoseTurn()) {
    return false;
  }
  if (gameState.getLastAction().getType() === Action.MOVE) {
    return false;
  }
  let loc = action.getLoc();
  if (!isAdjacent(board, workerId, loc)) {
    return false;
  }
  if (heightDifference(board, workerId, loc) > 1) {
    return false;
  }
  if (board.getHeight(loc[0], loc[1]) >= board.MAX_HEIGHT) {
    return false;
  }
  return board.isValidUnoccupiedLoc(loc[0], loc[1]);
}

/* GameState Action -> Boolean
Checks if it is valid for the given Player to take the given BuildAction under the given
GameState. This is allowed if:
  - the Worker that is building belongs to the Player whose turn it is
  - that Player did just move a Worker
  - the Location the Worker is building on is:
    - adjacent to its current Location
    - less than the max height of the Board
    - on the Board and not occupied by another Worker
*/
function validateBuildAction(gameState, action) {
  let board = gameState.getBoard();
  let workerId = action.getWorkerId();
  if (gameState.getOwner(workerId) !== gameState.getWhoseTurn()) {
    return false;
  }
  if (gameState.getLastAction().getType() !== Action.MOVE) {
    return false;
  }
  let loc = action.getLoc();
  if (!isAdjacent(board, workerId, loc)) {
    return false;
  }
  if (board.getHeight(loc[0], loc[1]) >= board.MAX_HEIGHT) {
    return false;
  }
  return board.isValidUnoccupiedLoc(loc[0], loc[1]);
}

/* GameState Location -> Boolean
  Checks if the given Location is a winning one on the Board in the
  given GameState.

  A winning Location is one where the height of that location is
  equal to the WINNING_HEIGHT.
 */
function isWinningLocation(gameState, location) {
  let board = gameState.getBoard();
  let height = board.getHeight(location[0], location[1]);
  return height === WINNING_HEIGHT;
}

// +=========================== HELPERS ===========================+

/* Board WorkerId Location -> Boolean
Is the worker's location adjacent to the given location on the board?
*/
function isAdjacent(board, id, newLoc) {
  let workerLoc = board.getWorker(id);
  let newX = newLoc[0];
  let newY = newLoc[1];
  let xDist = Math.abs(workerLoc[0] - newX);
  let yDist = Math.abs(workerLoc[1] - newY);
  return xDist <= 1 && yDist <= 1;
}

/* Board WorkerId Location -> Number
Return the difference in height between the worker's location
and the given location on the board.
Positive difference means the given location is higher.
*/
function heightDifference(board, id, otherLoc) {
  let workerLoc = board.getWorker(id);
  let x = otherLoc[0];
  let y = otherLoc[1];
  return board.getHeight(x, y) - board.getHeight(workerLoc[0], workerLoc[1]);
}

module.exports = {
  "validate": validate,
  "isWinningLocation": isWinningLocation,
  "WINNING_HEIGHT": WINNING_HEIGHT,
  "MAX_WORKERS_PER_PLAYER": MAX_WORKERS_PER_PLAYER
};
