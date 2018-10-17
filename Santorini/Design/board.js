// Lays out the general structure of the main components of the Santorini game.
// A Game holds all the relevant game data and status of a single round of Santorini.
// It consists of:
//  - A Board
//  - A list of Workers
//  - A Rulebook
//  - The turn number
class Game {

  /*
  These are the valid commands that the server will receive to operate on the game.
  - ["place-worker", N, N]
  - ["move", worker-id:int, x:N, y:N]
  - ["build", x:N, y:N]
  N is a natural number from 0 to 5.
   */

  constructor() {
    // Initialize the board
    this.board = new Board();
    // Create an empty worker list
    this.workers = [];
    // Initialize the rulebook
    this.ruleBook = new Rulebook();
    /*
    The phases of the game and each turn are represented as an integer.
    - -2 = player 1 place worker
    - -1 = player 2 place worker
    - 0 = player 1 move worker
    - 1 = player 1 build
    - 2 = player 2 move worker
    - 3 = player 2 build
     */
    // Keep track of the turn of the game.
    this.turn = -2;
  }

  // Creates a new Worker object belonging to the player who invokes this method via command.
  // This new Worker is given an ID based on how many workers that player has already placed.
  // Throws an error if the place was invalid.
  // Int Int Int -> GameView
  placeWorker(player, x, y) {
    // Check if it's the player's turn to place
    // Check if the given tile is unoccupied
    // Create a new Worker object
    // Add the new Worker to the list
    // Return renderGame()
  }

  // Move the player's worker to a surrounding tile on the board.
  // Throws an error if the move was invalid.
  // Int Int Int Int -> GameView
  moveWorkerToTile(player, workerID, x, y) {
    // Check ruleBook.isValidMove
    // If so, update the given Worker's posn to the given coordinates with Worker.setPosn
    // Check ruleBook.isGameOver
    // Return renderGame()
  }

  // Builds a new floor at the given tile using the given worker.
  // Throws an error if the build was invalid.
  // Int Int Int Int -> GameView
  buildOnTile(player, workerID, x, y) {
    // Check ruleBook.isValidBuild
    // If so, update the tile at the given coordinate's height on the board with Board.buildOnTile
    // Check ruleBook.isGameOver
    // Return renderGame()
  }

  /*
  A GameView is a JSON object holding copies of both the board array representation and the worker list:
  {"board":this.board.getBoard(), "workers":this.workers}
   */
  // Returns a GameView to be seen by the players.
  renderGame() {

  }
}


// Encapsulates the data of the game board, offering any necessary methods to access or interact with the board itself.
// A Board looks like:
//   [[H, ...],
//    ...     ]
// Array dimensions for now are always 6 by 6. Height (H) is an int from 0 to 4 representing height.
class Board {

  // Create a new board representing the starting state of the game.
  constructor() {
    this.board = this.createBoard(6, 6);
  }

  // Creates a new game board array with the given dimensions, each tile initialized to 0.
  // Takes in a height and width in the case that future iterations game boards allow for multiple sizes.
  // Int Int -> Board
  createBoard(width, height) {
    // Initialize an array of size height.
    // Initialize each element in that array to a new array of size width.
    // Each element of those arrays will initialize to the value 0 and set this.board to it.
  }

  // Increment the height of a tile in the board. Will not be executed unless the Game that it is running in
  // determines that the build is valid. Throws an error if the given coordinates are out of bounds.
  // Int Int -> Void
  buildOnTile(x, y) {

  }

  // Returns the number representing the height of the building on the tile at the given coordinates.
  // Throws an error if the given coordinates are out of bounds.
  // Int Int -> Height
  heightAtTile(x, y) {

  }

  // Return a copy of the board array. Improves readability.
  getBoard() {

  }
}

// Represents a Worker game piece. Holds a particular worker's identification and data.
// A worker is identified by the player who owns it and it's ID.
class Worker {
  // A worker is initialized to a particular position on the game board, owned by one of the two players.
  // Int Int Int Int -> Worker
  constructor(x, y, id, player) {
    this.player = player;
    this.id = id;
    this.posn = {"x":x, "y":y};
  }

  // Compares this worker's position to the given position. If they are equal, return true.
  // Int Int -> Boolean
  isOnTile(x, y) {

  }

  // Set the position of the Worker to the given coordinates
  // Int Int -> Void
  setPosn(x, y) {

  }
}

// Holds all of the methods for checking for valid moves and preventing illegal actions.
class Rulebook {
  constructor () {
    // Has no fields to initialize
  }

  // Returns true if the move satisfies designated move conditions.
  // Throws various types of error codes depending on how the move may be invalid.
  // Int Board Int Int Int Int -> Boolean
  isValidMove(turn, board, player, workerID, x, y) {
    // Valid move conditions:
    // - it is the correct player's turn;
    // - the given tile is in bounds and neighboring the worker;
    // - there is no other worker on the target field;
    // - a worker may jump down any number of floors; and
    // - the building on the target field is at most one floor taller than the one where the worker is currently located.
  }

  // Returns true if the build command satisfies the designated build conditions.
  // Int Board Int Int Int Int -> Boolean
  isValidBuild(turn, board, player, workerID, x, y) {
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
}