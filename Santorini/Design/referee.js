const Rulechecker = require('./rulechecker');
const Board = require('../Common/board');
const c = require('../Lib/constants');

/**
 * A PlaceRequest is a: ["place", x:int, y:int]
 *
 * A MoveRequest is a: ["move", workerID, Direction]
 *
 * A BuildRequest is a: ["build", Direction]
 *
 * A Turn is a [MoveRequest(, BuildRequest)]
 *
 * An InitWorker is a: {player: string, x: int, y: int}
 */

// A class to handle the different phases of the game - Initialization, Steady-State, and Game Over
class Referee {

  constructor() {
    this.board = null;
    this.playerMap = {};
  }

  // Called when a player connects to add player to the game
  // String -> void
  addPlayerToGame(name) {
    // When a player connects, this creates a Player object and adds them to the player map
    // Once MAX_PLAYERS are added, call initializeGame()
  }

  // After all players are connect, initialize the game board with ListOfInitWorkers
  // and start the game
  // void -> void
  initializeGame() {
    // Until max workers are added, take turns between players asking to submit a PlaceRequest
    // If request is valid, turn it into an InitWorker and add to ListOfInitWorkers
    // Initialize board and call playGame()
  }

  // Main Game loop, where we request actions from players and check their validity before applying them.
  // Directly modifies the board stored by this class.
  // void -> void
  playGame() {
    // Requests a Turn from the Player whose turn it is by passing them a copy of the board
    // Accepts request and sends to isValidTurnRequest()
    // If valid request, apply Turn to the board, and update game phase
    // If invalid request, restart loop and ask for another request
  }

  // Checks if the Turn given by a player is well-formed/valid.
  // Turn -> Boolean
  isValidTurnRequest(turn) { //  todo this is  definitely going into the rule checker -sb
    // Parses out necessary data and dispatches to rulechecker
  }

  // Checks if PlaceRequest given by a player is well-formed/valid
  // PlaceRequest -> Boolean
  isValidPlaceRequest(placeRequest) {
    // Parses out necessary data and dispatches to rulechecker
  }

  // Actions to perform once the game is over
  gameOver() {

  }
}