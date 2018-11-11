/* Represents a Player in a game of Santorini, which is carried through the various phases of the game.

  This implementation returns only malformed PlaceRequests and Turns.

  It can be used to test Referees, tournament managers, and other components that
  are supposed to be able to gracefully handle misbehavior from Players like this one.

  DATA DEFINITIONS:

  Board is defined in Common/board.js
  InitWorker is defined in Common/board.js
  All request types (PlaceRequest, MoveRequest, BuildRequest) and Turn are defined in strategy.js
*/

class BrokenTurnPlayer {
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
}

module.exports = BrokenTurnPlayer;