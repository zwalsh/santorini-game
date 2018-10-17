// Holds all of the methods for checking for valid moves and preventing illegal actions.
class Rulebook {
  constructor () {
    // Has no fields to initialize
  }

  // Returns true if the move satisfies designated move conditions.
  // Throws various types of error codes depending on how the move may be invalid.
  // Int Board Int Int Int Int -> Boolean
  isValidMove(turn, gameView, player, workerID, x, y) {
    // Valid move conditions:
    // - it is the correct player's turn;
    // - the given tile is in bounds and neighboring the worker;
    // - there is no other worker on the target field;
    // - a worker may jump down any number of floors; and
    // - the building on the target field is at most one floor taller than the one where the worker is currently located.
  }

  // Returns true if the build command satisfies the designated build conditions.
  // Int Board Int Int Int Int -> Boolean
  isValidBuild(turn, gameView, player, workerID, x, y) {
    // Valid build conditions:
    // - it is the correct player's turn;
    // - the requested tile is in bounds and neighboring to the worker;
    // - the building doesn't already have four floors.
  }

  // Returns true if the game state is detected as one of the three endgame conditions.
  // GameView -> Boolean
  isGameOver(gameView) {
    // Check for all endgame states:
    // - a player’s worker reaches the third level of a building;
    // - a player can’t move a worker to a two-story (or shorter) building; or
    // - a player can move a worker but not add a floor to a building after the move.
  }

  // Sees if there's a worker on the specified tile.
  // Int Int Listof<Worker> -> Boolean
  isOccupied(x, y, workerList) {

  }

  // Sees if the given tile coordinate is in one of the 8 spaces around the given worker
  // Int Int Int Int -> Boolean
  isSurrounding(x, y, player, workerID) {

  }
}

// Represents a Player of the game, which is carried through the various phases of the game. Will be an AI component
// eventually, however right now it's simply a way for a player to interact with the game.
class Player {
  // Instantiates a Player with their own given name as well as the unique name given by the software.
  constructor (name, uniqueID) {
    this.name = name;
    this.id = uniqueID;
  }

  // Initialization phase of the game. Submits a place new worker request at the given coordinates to the administrator.
  // Int Int -> Void
  placeInitialWorker(x, y) {

  }

  // Steady state of the game. When the user is prompted to take a turn, this will be called so the player can
  // first move and then build. Wrapper method for the player to interact with the game. For an AI player, move and
  // build logic will be determined here.
  // GameView -> Void
  takeTurn(gameView) {
    // Generally it will first submit a move, then submit a build.
    // Depending on implementation, player can check if the moves being made are valid before submitting
  }

  // Allows the user to see if the desired move is valid. Queries the game to find out.
  // GameView Int Int Int Int -> Boolean
  checkIfMoveIsValid(gameView, player, workerID, x, y) {

  }

  // Allows the user to see if the desired build is valid. Queries the game to find out.
  // GameView Int Int Int Int -> Boolean
  checkIfBuildIsValid(gameView, player, workerID, x, y) {

  }

  // Submit the desired move action to the administrator.
  // Int Int Int -> Void
  submitMove(workerID, x, y) {

  }

  // Submit the desired build action to the administrator.
  // Int Int Int -> Void
  submitBuild(workerID, x, y) {

  }

  // Request a gameView of the Board state.
  // Nothing -> GameView
  viewBoard() {

  }

  // Shut down phase of the game. Can be used to do things like disconnect, rematch, quit, or whatever the spec will
  // require it to do. Unclear as of right now what is expected at Game Over.
  // Nothing -> Void
  gameEnded() {

  }
}