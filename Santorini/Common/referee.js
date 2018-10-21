const Rulechecker = require('./rulechecker');
const Board = require('../Common/board');
const c = require('../Lib/constants');

/**

 A Referee controls the flow of the game, maintaining the official
 version of the game state and getting Turns from each player in turn.

 Before applying a player's Turn, the Referee must do the following:
  - ensure the well-formedness of the Turn
  - ensure that the Turn matches the Player that provided it
  - validate the request(s) using the Rulechecker

 After every Turn, the referee checks for endgame conditions, meaning either
 that the Player just reached the winning height, or that it has blocked in
 its opponent.

 If it determines that a player has won the game, it notifies both
 players of the game result.

 A Referee may play one or n games. After each game, it will notify
 each Player of the result of each game. When the game (or games) is/are complete,
 it will return the result, or a length n list of each result in order.

 * ======================== DATA DEFINITIONS ======================
 *
 * A WorkerRequest is a: {player: string , id: int}
 *
 * A PlaceRequest is a: ["place", x:int, y:int]
 *
 * A MoveRequest is a: ["move", WorkerRequest, Direction]
 *
 * A BuildRequest is a: ["build", Direction]
 *
 * A Turn is a [MoveRequest(, BuildRequest)]
 *
 * An InitWorker is a: {player: string, x: int, y: int}
 *
 * An EndGameReason is one of:
 * - "WON"
 * - "BROKEN RULE"
 *
 * A GameResult is a [String, EndGameReason] where the String
 * is the name of the winner of the game.
 */

// A class to handle the different phases of the game - Initialization, Steady-State, and Game Over
class Referee {

  constructor() {
    this.board = null;
    this.playerMap = {};
  }

  /* Void ->

   */
  playGame() {

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