/* Represents a Player in a game of Santorini, which is carried through the various phases of the game.
  It produces Turns and places Workers (as appropriate) when it is requested to do so,
  and when it is given an update on the current state of the game.

  This implementation delegates to a Player on the other side of a Socket.

  Data Definitions: See Common/player-interface.js
*/

class RemoteProxyPlayer {
  /* Socket -> RPP
    Instantiates a RPP that communicates with the Player on the
    client side of the socket.
  */
  constructor(socket) {
  }

  /* String -> Promise<Void>
    Set this player's ID to the given identifier.
    Return a Promise that resolves to indicate receipt of the name.
  */
  setId(id) {
  }

  /* [InitWorker, ...] -> Promise<PlaceRequest>
    Given the list of worker locations that have already been claimed on the Board,
    produce a PlaceRequest representing where this Player would like to put
    their next Worker.
  */
  placeInitialWorker(existingWorkers) {
  }

  /* Board -> Promise<Turn>
    Given the current state of the game board, produce the Turn that
    this Player wishes to take.
  */
  takeTurn(board) {
  }

  /* String -> Promise<Void>
    Notify this Player that they have been put into a new game,
    against an opponent with the given ID.
  */
  newGame(opponentId) {
  }

  /* GameResult -> Promise<Void>
    Notify this Player of the result of a game they played,
    so that internal information can be reset/updated as necessary
  */
  notifyGameOver(gameResult) {
  }

  /* [GameResult, ...] -> Promise<Void>
    Notify this Player of the results of a tournament,
    in the form of a list of the results every game played.
  */
  notifyTournamentOver(gameResults) {
  }
}

module.exports = RemoteProxyPlayer;