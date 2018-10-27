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
  // Instantiates a Player with their own given name.
  constructor (name) {
    this.name = name;
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

  /* String -> Player
    Notify this Player that they have been put into a new game, against the given opponent,
    so that internal information can be reset/updated as necessary
  */
  newGame(opponentName) {
    this.strategy = new Strategy(this.name, opponentName, 4, 0);
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