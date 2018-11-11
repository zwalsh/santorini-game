/* Represents a Player in a game of Santorini, which is carried through the various phases of the game.
  It produces Turns and places Workers (as appropriate) when it is requested to do so,
  and when it is given an update on the current state of the game.

  DATA DEFINITIONS:

  A WorkerRequest is a: {player: string , id: int}

  A PlaceRequest is a: ["place", x:int, y:int]

  A MoveRequest is a: ["move", WorkerRequest, Direction]

  A BuildRequest is a: ["build", Direction]

  A Turn is a [MoveRequest(, BuildRequest)]

  Board is defined in Common/board.js

  InitWorker is defined in Common/board.js
*/


class Player {
  // Instantiates a Player.
  constructor () {
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

  /* UUID UUID -> Promise<Void>
    Notify this Player that they have been put into a new game.
    The first UUID is this Player's ID for the game, and the second UUID
    is the opponent's.
  */
  newGame(myId, opponentId) {
  }

  /* GameResult -> Promise<Void>
    Notify this Player of the result of a game they played,
    so that internal information can be reset/updated as necessary
  */
  notifyGameOver(gameResult) {
  }
}

module.exports = Player;