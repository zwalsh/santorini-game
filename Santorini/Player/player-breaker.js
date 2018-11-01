/* Represents a Player in a game of Santorini, which is carried through the various phases of the game.
  It produces Turns and places Workers (as appropriate) when it is requested to do so,
  and when it is given an update on the current state of the game.

  This implementation returns only malformed PlaceRequests and Turns.
  It can be used to test Referees, tournament managers, and other components that
  are supposed to be able to gracefully handle misbehavior from Players like this one.

  DATA DEFINITIONS:

  Board is defined in Common/board.js
  InitWorker is defined in Common/board.js
  All request types (PlaceRequest, MoveRequest, BuildRequest) and Turn are defined in strategy.js
*/

class BrokenPlayer {
  constructor () {
    // Player has a UUID identifier, which is game-specific and set in newGame()
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

  /* UUID UUID -> Promise<Void>
    Notify this Player that they have been put into a new game.
    The first UUID is this Player's ID for the game, and the second UUID
    is the opponent's.
  */
  newGame(myId, opponentId) {
    this.id = myId;
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

module.exports = BrokenPlayer;