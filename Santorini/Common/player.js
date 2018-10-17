// // Represents a Player of the game, which is carried through the various phases of the game. Will be an AI component
// // eventually, however right now it's simply a way for a player to interact with the game.
// class Player {
//   // Instantiates a Player with their own given name as well as the unique name given by the software.
//   constructor (name, id) {
//     this.name = name;
//     // ID is either 1 or 2
//     this.id = id;
//
//     // Data representation of gameview?
//     this.gameView = {};
//
//
//     // this.strategy = new Strategy();
//
//   }
//
//   // Initialization phase of the game. Submits a place new worker request at the given coordinates to the administrator.
//   // Listof InitWorker Int Int -> Void
//   placeInitialWorker(workerlist, x, y) {
//
//   }
//
//   // Steady state of the game. When the user is prompted to take a turn, this will be called so the player can
//   // first move and then build. Wrapper method for the player to interact with the game. For an AI player, move and
//   // build logic will be determined here.
//   // GameView -> Turn
//   takeTurn(gameView) {
//
//   //  return this.strategy.getNextTurn(gameView);
//
//     // Depending on implementation, player can check if the moves being made are valid before submitting
//   }
//
//   // Allows the user to see if the desired move is valid. Queries the game to find out.
//   // GameView Int Int Int Int -> Boolean
//   checkIfMoveIsValid(gameView, player, workerID, x, y) {
//
//   }
//
//   // Allows the user to see if the desired build is valid. Queries the game to find out.
//   // GameView Int Int Int Int -> Boolean
//   checkIfBuildIsValid(gameView, player, workerID, x, y) {
//
//   }
//
//   // Request a gameView of the Board state.
//   // Nothing -> GameView
//   viewBoard() {
//
//   }
//
//   // Shut down phase of the game. Can be used to do things like disconnect, rematch, quit, or whatever the spec will
//   // require it to do. Unclear as of right now what is expected at Game Over.
//   // Nothing -> Void
//   gameEnded() {
//
//   }
// }