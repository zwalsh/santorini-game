/* Represents a Player in a game of Santorini, which is carried through the various phases of the game.

  This implementation breaks on all inputs/communications.

  It can be used to test Referees, tournament managers, and other components that
  are supposed to be able to gracefully handle misbehavior from Players like this one.

  DATA DEFINITIONS:

  Board is defined in Common/board.js
  InitWorker is defined in Common/board.js
  All request types (PlaceRequest, MoveRequest, BuildRequest) and Turn are defined in strategy.js
*/

class BrokenPlayer {
  constructor (id) {
  }

  /* String -> Promise<Void>

  */
  setId(id) {
    return Promise.reject();
  }

  /* [InitWorker, ...] -> Promise<PlaceRequest>
    Produce a malformed PlaceRequest.
  */
  placeInitialWorker(existingWorkers) {
    let malformedPlace = ["pane", -69, -420];
    return Promise.resolve(malformedPlace);
  }

  /* Board -> Promise<Turn>
    Produce a malformed Turn.
  */
  takeTurn(board) {
    let malformedTurn = [["siirry", {}, ["LÄNSI", "POHJOIS"]],
      ["rakenna", ["ITÄ", "ETELÄ"]]];
    return Promise.resolve(malformedTurn);
  }

  /* String -> Promise<Void>
    Notify this Player that they have been put into a new game,
    against an opponent with the given ID.
  */
  newGame(opponentId) {
    return Promise.reject();
  }

  /* GameResult -> Promise<Void>
    Notify this Player of the result of a game they played,
    so that internal information can be reset/updated as necessary
  */
  notifyGameOver(gameResult) {
    // Nothing to do here for now.
    return Promise.reject();
  }
}

module.exports = BrokenPlayer;