/* Represents a Player in a game of Santorini, which is carried through the various phases of the game.
  It produces Turns and places Workers (as appropriate) when it is requested to do so,
  and when it is given an update on the current state of the game.

  This implementation uses a Strategy to generate its Placements and Turns.

  Data Definitions: See Common/player-interface.js
*/

const Strategy = require('./strategy');

class Player {
  constructor (id) {
    this.id = id;
  }

  /* String -> Promise<Void>
    Set this player's ID to the given identifier.
    Return a Promise that resolves to indicate receipt of the name.
  */
  setId(id) {
    this.id = id;
    return Promise.resolve();
  }

  /* [InitWorker, ...] -> Promise<PlaceRequest>
    Given the list of worker locations that have already been claimed on the Board,
    produce a PlaceRequest representing where this Player would like to put
    their next Worker.
  */
  placeInitialWorker(existingWorkers) {
    return Promise.resolve(this.strategy.getNextWorkerPlace(existingWorkers));
  }

  /* Board -> Promise<Turn>
    Given the current state of the game board, produce the Turn that
    this Player wishes to take.
  */
  takeTurn(board) {
    return Promise.resolve(this.strategy.getNextTurn(board));
  }

  /* String -> Promise<Void>
    Notify this Player that they have been put into a new game,
    against an opponent with the given ID.
  */
  newGame(opponentId) {
    this.strategy = new Strategy(this.id, opponentId, 2, 0);
    return Promise.resolve();
  }

  /* GameResult -> Promise<Void>
    Notify this Player of the result of a game they played,
    so that internal information can be reset/updated as necessary
  */
  notifyGameOver(gameResult) {
    // Nothing to do here for now.
    return Promise.resolve();
  }

  /* [GameResult, ...] -> Promise<Void>
    Notify this Player of the results of a tournament,
    in the form of a list of the results every game played.
  */
  notifyTournamentOver(gameResults) {
    // Nothing to do here for now.
    return Promise.resolve();
  }
}

module.exports = Player;