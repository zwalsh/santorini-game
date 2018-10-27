/* Represents a Player of the game, which is carried through the various phases of the game.
  Must be able to produce a Turn or place a Worker (as appropriate) when it is requested to do so (and is given
  an update as to the current state of the game).

  This implementation uses a Strategy to generate its Placements and Turns.

  DATA DEFINITIONS:

  Board is defined in Common/board.js
  InitWorker is defined in Common/board.js
  All request types (PlaceRequest, MoveRequest, BuildRequest) and Turn are defined in strategy.js
*/

const Strategy = require('./strategy');

class Player {
  constructor () {
    // Player has a UUID identifier and a Strategy to delegate
    // place/turn generation to. Both are game-specific and set in newGame()
  }

  /* [InitWorker, ...] -> PlaceRequest
    Given the list of worker locations that have already been claimed on the Board,
    produce a PlaceRequest representing where this Player would like to put
    their next Worker.
  */
  placeInitialWorker(existingWorkers) {
    return this.strategy.getNextWorkerPlace(existingWorkers);
  }

  /* Board -> Turn
    Given the current state of the game board, produce the Turn that
    this Player wishes to take.
  */
  takeTurn(board) {
    return this.strategy.getNextTurn(board);
  }

  /* UUID UUID -> Void
    Notify this Player that they have been put into a new game.
    The first UUID is this Player's ID for the game, and the second UUID
    is the opponent's.
  */
  newGame(myId, opponentId) {
    this.id = myId;
    this.strategy = new Strategy(myId, opponentId, 4, 0);
  }

  /* GameResult -> Void
    Notify this Player of the result of a game they played,
    so that internal information can be reset/updated as necessary
  */
  notifyGameOver(gameResult) {
    // Nothing to do here for now.
  }
}

module.exports = Player;