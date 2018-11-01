/* Represents a Player in the game of Santorini that will produce a Promise that
  never resolves.

  It can be used to test Referees, tournament managers, and other components that
  are supposed to be able to gracefully Players that enter infinite loops
  (or just pretend to, like this one).

  DATA DEFINITIONS:

  Board is defined in Common/board.js
  InitWorker is defined in Common/board.js
  All request types (PlaceRequest, MoveRequest, BuildRequest) and Turn are defined in strategy.js
*/

class InfinitePlayer {
  // Instantiates a Player with their own given name.
  constructor (name) {
    this.infLoop = new Promise(resolve => {
      // this promise will never resolve
    });
  }

  /* [InitWorker, ...] -> Promise<PlaceRequest>
    Given the list of worker locations that have already been claimed on the Board,
    produce a PlaceRequest representing where this Player would like to put
    their next Worker.
  */
  placeInitialWorker(existingWorkers) {
    return this.infLoop;
  }

  /* Board -> Promise<Turn>
    Given the current state of the game board, produce the Turn that
    this Player wishes to take.
  */
  takeTurn(board) {
    return this.infLoop;
  }

  /* UUID UUID -> Promise<Void>
    Notify this Player that they have been put into a new game.
    The first UUID is this Player's ID for the game, and the second UUID
    is the opponent's.
  */
  newGame(myId, opponentId) {
    return this.infLoop;
  }

  /* GameResult -> Promise<Void>
    Notify this Player of the result of a game they played,
    so that internal information can be reset/updated as necessary
  */
  notifyGameOver(gameResult) {
    return this.infLoop;
  }
}

module.exports = InfinitePlayer;