/**
 * Data Definitions:
 *
 * A PlaceRequest is a: ["place", x:int, y:int]
 *
 * A MoveRequest is a: ["move", workerID, Direction]
 *
 * A BuildRequest is a: ["build", Direction]
 *
 * A Turn is a [MoveRequest, BuildRequest]
 *
 * An InitWorker is a: [playerString, xInt, yInt]
 * Init workers come from the referee on startup of the game.
 *
 * A GameView is a: {board: Board, workers: ListOfWorker}
 */

// Interface for planning actions for the Player. Can be represented by an AI or simply a human at a keyboard.
class Strategy {
  constructor () {
    // Nothing to initialize in this interface
  }

  // Retrieve the desired coordinates for placement of workers during the setup phase.
  // ListOfInitWorker -> PlaceRequest
  getNextWorkerPlace(workerList) {

  }

  // Determines the next move and build requests from the GameView
  // GameView -> Turn
  getNextTurn(gameView) {
    // If the game is over after a move request, we don't need to send a build request
  }

}