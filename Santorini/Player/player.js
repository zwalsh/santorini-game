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
  // Instantiates a Player with their own given name, their opponent's name,
  // as well as the unique name given by the software.
  // String String -> Player
  constructor (name, opponentName) {
    this.name = name;
    this.strategy = new Strategy(name, opponentName, 4, 0);
  }

  // Initialization phase of the game. Submits a place new worker request to the administrator, given
  // the list of Workers that have been placed so far.
  // Listof InitWorker -> PlaceRequest
  placeInitialWorker(existingWorkers) {
    return this.strategy.getNextWorkerPlace(existingWorkers);
  }

  // Steady state of the game. When the user is prompted to take a turn, this will be called so the player can
  // first move and then build. Wrapper method for the player to interact with the game.
  // Board -> Turn
  takeTurn(board) {
    return this.strategy.getNextTurn(board);
  }
}

module.exports = Player;