/* Implements a wrapper around a Player designed to handle unexpected, erroneous, or malicious
  behavior by the Player. Fulfills the Player interface by delegating to the given Player.

  Will always return a Promise that resolves or rejects within the specified timeout.

  DATA DEFINITIONS:

  Board is defined in Common/board.js
  InitWorker is defined in Common/board.js
  All request types (PlaceRequest, MoveRequest, BuildRequest) and Turn are defined in strategy.js
*/


class GuardedPlayer {
  /* Player Number -> GuardedPlayer
    Constructs a GuardedPlayer that protects calls to the given Player, always
    returning within the given timeout (in ms).
   */
  constructor(player, timeout) {
    this.player = player;
    this.timeout = timeout;
  }

  /* [Player -> Promise<X>] -> Promise<X>
    Uses the given function to produce a Promise with this GuardedPlayer's Player.

    Returns a new Promise that will resolve if the produced Promise resolves within
    the timeout, else rejects, including in the case where the playerFunction fails
    to provide a Promise.
  */
  protectedPromise(playerFunction) {
    let timeoutPromise = new Promise((resolve, reject) => {
      setTimeout(reject, this.timeout);
    });
    try {
      let playerPromise = playerFunction(this.player);
      if (!(playerPromise instanceof Promise)) {
        return Promise.reject();
      }
      return Promise.race([timeoutPromise, playerPromise]);
    } catch (err) {
      // this catches the case where playerFunction itself throws an error
      return Promise.reject();
    }
  }

  /* [InitWorker, ...] -> Promise<PlaceRequest>
    Given the list of worker locations that have already been claimed on the Board,
    produce a PlaceRequest representing where this Player would like to put
    their next Worker.
  */
  placeInitialWorker(existingWorkers) {
    return this.protectedPromise((p) => {
      return p.placeInitialWorker(existingWorkers)
    });
  }

  /* Board -> Promise<Turn>
    Given the current state of the game board, produce the Turn that
    this Player wishes to take.
  */
  takeTurn(board) {
    return this.protectedPromise((p) => {
      return p.takeTurn(board)
    });
  }

  /* UUID UUID -> Promise<Void>
    Notify this Player that they have been put into a new game.
    The first UUID is this Player's ID for the game, and the second UUID
    is the opponent's.
  */
  newGame(myId, opponentId) {
    return this.protectedPromise((p) => {
      return p.newGame(myId, opponentId)
    });
  }

  /* GameResult -> Promise<Void>
    Notify this Player of the result of a game they played,
    so that internal information can be reset/updated as necessary
  */
  notifyGameOver(gameResult) {
    return this.protectedPromise((p) => {
      return p.notifyGameOver(gameResult)
    });
  }
}

module.exports = GuardedPlayer;