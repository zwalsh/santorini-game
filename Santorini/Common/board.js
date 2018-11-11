const Worker = require('./worker');
const directionToCoordinate = require('./direction').directionToCoordinate;
const c = require('./constants');

/**
 * Data Definitions:
 *
 * Height (H) is a: int from 0 to 4 representing height.
 *
 * A Board is a:
 *   [[H, ...],
 *    ...     ]
 *
 * An InitWorker is a: {player: string, x: int, y: int},
 * representing where a player wants to place a worker at the start of the game.
 *
 * A WorkerRequest is a: {player: string , id: int}
 *
 * Direction and Posn are defined in direction.js
 */

// Encapsulates the data of the game board, offering any necessary methods to access or interact with the board itself.
class Board {

  // ListOfInitWorker (Board) (ListOfWorker) -> Board
  constructor(initWorkerList, initBoard = null, workersList = null) {
    // Generate a new board of heights 0 with dimensions based on the constants for this game.
    // If the constructor was given an initBoard (for testing purposes), set it to that.
    this.board = initBoard || Board.createBoard(c.BOARD_WIDTH, c.BOARD_HEIGHT);

    // Create a list of new Workers based on the InitWorker list
    this.workers = workersList || Board.createWorkerList(initWorkerList);
  }

  // Creates a new game board array with the given dimensions, each tile initialized to 0.
  // Int Int -> Board
  static createBoard(width, height) {
    let board = [];

    for (let i = 0; i < height; i++) {
      board.push([]);
      for (let j = 0; j < width; j++) {
        board[i].push(0);
      }
    }
    return board;
  }

  // Creates a new list of Worker objects using the given InitWorkerList
  // ListOfInitWorker -> ListOfWorker
  static createWorkerList(initWorkerList) {
    // Result list
    let workers = [];

    // Map user IDs to current number of workers. Ex. {"alfred":1, "sampson":2}
    let wMap = {};

    for (let i = 0; i < initWorkerList.length; i++) {
      let w = initWorkerList[i];

      // If the wMap doesn't have an entry for the player id, make one.
      if (!(w.player in wMap)) {
        wMap[w.player] = 0;
      }

      // Add the new Worker object to the list and increment the number of workers for that player.
      workers.push(new Worker(w.x, w.y, ++wMap[w.player], w.player));
    }

    return workers;
  }

  /* [InitWorker, ...] -> [InitWorker, ...]
    Create a deep copy of the list of InitWorkers.
   */
  static copyInitWorkerList(initWorkers) {
    return initWorkers.map(iw => ({
      player: iw.player,
      x: iw.x,
      y: iw.y
    }));
  }

  /* Turn -> Void
    Apply the given turn to this board.
   */
  applyTurn(turn) {
    let moveReq = turn[0];
    let workerReq = moveReq[1];
    this.moveWorker(workerReq, moveReq[2]);
    if (turn.length === 2) {
      let buildReq = turn[1];
      this.buildWithWorker(workerReq, buildReq[1]);
    }
  }

  // Move the player's worker to the Target Tile
  // WorkerRequest Direction -> Void
  moveWorker(workerRequest, direction) {
    let w = this.findWorker(workerRequest);
    let target = this.getNeighborTile(workerRequest, direction);
    w.setPosn(target.x, target.y);
  }

  // Increment the height of a tile at the Target Tile
  // WorkerRequest Direction -> Void
  buildWithWorker(workerRequest, direction) {
    let target = this.getNeighborTile(workerRequest, direction);
    this.board[target.y][target.x]++;
  }

  // Determines if the Target Tile exists/is not out of bounds.
  // WorkerRequest Direction -> Boolean
  workerHasNeighbor(workerRequest, direction) {
    let target = this.getNeighborTile(workerRequest, direction);
    return (target.x >= 0 && target.x < c.BOARD_WIDTH)
         && (target.y >= 0 && target.y < c.BOARD_HEIGHT);
  }

  // Determines if the Target Tile is occupied by another worker.
  // WorkerRequest Direction -> Boolean
  workerNeighborIsOccupied(workerRequest, direction) {
    let target = this.getNeighborTile(workerRequest, direction);

    if (this.workerHasNeighbor(workerRequest, direction)) {
      return this.workers.some((w) => w.isOnTile(target.x, target.y));
    }
    return false;
  }

  // Determines the height of the Target Tile. Throws an error if the requested tile does not exist.
  // WorkerRequest Direction -> Height
  workerNeighborHeight(workerRequest, direction) {
    let target = this.getNeighborTile(workerRequest, direction);

    if (this.workerHasNeighbor(workerRequest, direction)) {
      return this.heightAtTile(target.x, target.y);
    } else throw "Worker has no neighbor in given direction.";
  }

  // Finds the Worker object in this board's list of workers based on the given WorkerRequest.
  // WorkerRequest -> Worker
  findWorker(workerRequest) {
    return this.workers.find((worker) => {
      return worker.player === workerRequest.player && worker.id === workerRequest.id;
    });
  }

  // Calculates the Posn of a neighboring tile relative to the requested worker.
  // WorkerRequest Direction -> Posn
  getNeighborTile(workerRequest, direction) {
    let w = this.findWorker(workerRequest);

    return directionToCoordinate(direction, w.posn.x, w.posn.y);
  }

  // Returns the Height of the building on the tile at the given coordinates.
  // Throws an error if the given coordinates are out of bounds.
  // Int Int -> Height
  heightAtTile(x, y) {
    return this.board[y][x];
  }

  // Return a copy of the board array.
  // Nothing -> ArrayOfArrayOfHeights
  getBoard() {
    return this.board.map((e) => e.slice());
  }

  // Return a copy of the worker array.
  // Nothing -> ListOfWorker
  getWorkers() {
    return this.workers.map((w) => new Worker(w.posn.x, w.posn.y, w.id, w.player));
  }

  // Returns a new copy of the Board.
  // Nothing -> Board
  copy() {
    return new Board(null, this.getBoard(), this.getWorkers());
  }

}

module.exports = Board;