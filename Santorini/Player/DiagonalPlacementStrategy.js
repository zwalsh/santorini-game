/*
  This module provides a strategy for placing Workers on the Board.

  It returns a PlaceAction that will place a Worker along the diagonal
  from [0, 0] to [size, size], in the first empty spot.

  If no such empty spot is available, it will return false.

  Data Definitions:

  GameState is defined in GameState.js
  PlaceAction is defined in Action.js

 */

const PlaceAction = require('../Common/Action.js').PlaceAction;

/* GameState -> [Maybe PlaceAction]
  Returns a PlaceAction that places a Worker on the first empty spot along the
  diagonal. If no such empty place exists, it returns false.
 */
function choosePlacement(gameState) {
  let index = 0;
  let board = gameState.getBoard();
  while (board.isValidLoc(index, index) && !board.isValidUnoccupiedLoc(index, index)) {
    index++;
  }
  return index >= board.getSize() ? false : new PlaceAction([index, index]);
}

module.exports = {
  "choosePlacement": choosePlacement
}
