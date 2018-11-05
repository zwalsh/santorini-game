/* Implements a wrapper around a Player designed to handle unexpected, erroneous, or malicious
  behavior by the Player. Fulfills the Player interface by delegating to the given Player.

  Will always return a Promise that resolves or rejects within the specified timeout.

  DATA DEFINITIONS:

  Board is defined in Common/board.js
  InitWorker is defined in Common/board.js
  All request types (PlaceRequest, MoveRequest, BuildRequest) and Turn are defined in strategy.js
*/

const protectedPromise = require('../Lib/promise-protector');

class GuardedPlayer {
  /* Player UUID Number -> GuardedPlayer
    Constructs a GuardedPlayer that protects calls to the given Player, always
    returning within the given timeout (in ms).
   */
  constructor(player, id, timeout) {
    this.player = player;
    this.id = id;
    this.timeout = timeout;


  }

  /* Void -> UUID
    Returns the UUID of the Player on this GuardedPlayer.
  */
  getId() {
    return this.id;
  }

  /* [InitWorker, ...] -> Promise<PlaceRequest>
    Given the list of worker locations that have already been claimed on the Board,
    produce a PlaceRequest representing where this Player would like to put
    their next Worker.
  */
  placeInitialWorker(existingWorkers) {
    return protectedPromise(this.player, (p) => {
      return p.placeInitialWorker(existingWorkers)
    }, this.timeout);
  }

  /* Board -> Promise<Turn>
    Given the current state of the game board, produce the Turn that
    this Player wishes to take.
  */
  takeTurn(board) {
    return protectedPromise(this.player, (p) => {
      return p.takeTurn(board)
    }, this.timeout);
  }

  /* String -> Promise<Void>
    Notify this Player that they have been put into a new game,
    against an opponent with the given name.
  */
  newGame(opponentId) {
    return protectedPromise(this.player, (p) => {
      return p.newGame(opponentId)
    }, this.timeout);
  }

  /* GameResult -> Promise<Void>
    Notify this Player of the result of a game they played,
    so that internal information can be reset/updated as necessary
  */
  notifyGameOver(gameResult) {
    return protectedPromise(this.player, (p) => {
      return p.notifyGameOver(gameResult)
    }, this.timeout);
  }
}

module.exports = GuardedPlayer;