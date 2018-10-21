const direction = require('../Lib/direction');
const dirs = direction.directions;
const c = require('../Lib/constants');

/**
 * An InitWorker is a: {player: string, x: int, y: int}
 * Init workers come from the referee on startup of the game.
 *
 * A WorkerRequest is a: {player: string , id: int}
 *
 * A MoveRequest is a: ["move", WorkerRequest, Direction]
 *
 * A BuildRequest is a: ["build", Direction]
 *
 * A Turn is a [MoveRequest, BuildRequest]
 *
 * Height (H) is a: int from 0 to 4 representing height
 *
 * A Direction is a: [EastWest, NorthSouth]
 * A EastWest is one of: "EAST" "PUT" "WEST"
 * A NorthSouth is one of: "NORTH" "PUT" "SOUTH".
 *
 * A Target Tile is a: Tile in the given direction relative to the given worker
 */

// Contains methods checking if given place, build, and move commands are valid. Also checks if the game is over.
class Rulechecker {

  constructor() {}

  // Sees if the given x and y coordinates is a valid position for a new InitWorker.
  // Checks posn bounds, and if tile is occupied.
  // ListOfInitWorker Int Int -> Boolean
  isValidPlace(initWorkerList, x, y) { // TODO REFACTOR into single return statement -sb
    if (this.tileIsInBounds(x, y)) {
      if (!initWorkerList.some((w) => w.x === x && w.y === y)) {
        return true;
      }
    }
    return false;
  }

  // Determines if the given x and y coordinates are within the board's boundaries.
  // Int Int -> Boolean
  tileIsInBounds(x, y) {
    return x >= 0 && x < c.BOARD_WIDTH && y >= 0 && y < c.BOARD_HEIGHT;
  }

  /* Board Turn -> Boolean
    Given the current board, is the entire Turn valid?

   */
  isValidTurn(board, turn) {
    // 1. move valid?
    // 2. if winning move, is turn just a move?
    // 3. else, apply move, is build valid?
    let moveReq = turn[0];
    let workerReq = moveReq[1];
    let moveDir = moveReq[2];
    if (!this.isValidMove(board, workerReq, moveDir)) {
      return false;
    }
    // If moving to a winning height, the turn is only valid if there is no build.
    let isMoveToWinningHeight = board.workerNeighborHeight(workerReq, moveDir) === c.WINNING_HEIGHT;
    if (turn.length === 1) {
      return isMoveToWinningHeight;
    }
    let buildDir = turn[1][1];
    let boardAfterMove = board.renderGame();
    boardAfterMove.moveWorker(workerReq, moveDir);
    return !isMoveToWinningHeight && this.isValidBuild(boardAfterMove, workerReq, buildDir);
  }

  // Sees if the move command satisfies Santorini's valid move conditions
  // Check valid move conditions:
  // - Common conditions pass (see below in checkValid())
  // - Target tile is at most one floor taller than the one where the worker is currently located.
  // Board WorkerRequest Direction -> Boolean
  isValidMove(board, workerRequest, direction) {
    if (this.checkValid(board, workerRequest, direction)) {
      if (board.workerNeighborHeight(workerRequest, direction) -
          board.workerNeighborHeight(workerRequest, ["PUT", "PUT"]) <= c.MAX_FLOORS_PER_MOVE) {
        return true;
      }
    }
    return false;
  }

  // Sees if the build command satisfies Santorini's valid build conditions.
  // Check valid build conditions:
  // - Common conditions pass (see below in checkValid())
  // Board WorkerRequest Direction -> Boolean
  isValidBuild(board, workerRequest, direction) {
    return this.checkValid(board, workerRequest, direction);
  }

  // Sees if the given move direction and build direction together are valid.
  // This means that either the Move is valid and leads to a win, or both the Move and Build are valid.
  // Board WorkerRequest Direction Direction -> Boolean
  isValidMoveBuild(board, workerRequest, moveDir, buildDir) {  // todo this needs refactoring to fit turn  def -sb
    let clone = board.renderGame();

    if (this.isValidMove(clone, workerRequest, moveDir)) {
      clone.moveWorker(workerRequest, moveDir);
      if (this.isValidBuild(clone, workerRequest, buildDir)) {
        return true;
      } else if (this.hasWon(clone, workerRequest.player)
              || this.hasLost(clone, workerRequest.player)) {
        return true;
      }
    }

    return false;
  }

  // Returns true if the command satisfies common conditions between build and move, else false.
  // Checks common conditions:
  // - Target tile is not current workers own tile
  // - Target tile is a tile in-bounds
  // - Target tile is not occupied by another worker
  // - Target tile is less than max height
  // Board WorkerRequest Direction -> Boolean
  checkValid(board, workerRequest, direction) {
    if (direction.join('') !== "PUTPUT") {
      if (board.workerHasNeighbor(workerRequest, direction)) {
        if (!board.workerNeighborIsOccupied(workerRequest, direction)) {
          if (board.workerNeighborHeight(workerRequest, direction) < c.MAX_HEIGHT) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // Check the Santorini win condition to see if the given player has won.
  // Board String -> Boolean
  hasWon(board, playerID) {
    return this.workerIsOnWinningHeight(board, playerID);
  }

  // Check the Santorini loss condition to see if the given player has lost.
  // Board String -> Boolean
  hasLost(board, playerID) {
    return this.workersCantMove(board, playerID)
  }

  // Sees if any worker owned by the given player is at the winning height.
  // Board String -> Boolean
  workerIsOnWinningHeight(board, playerID) {
    return board.workers.filter((w) => w.player === playerID).some((w) => {
      return board.heightAtTile(w.posn.x, w.posn.y) === c.MAX_HEIGHT - 1;
    });
  }

  // Sees if both workers owned by the given player cannot move.
  // Board String -> Boolean
  workersCantMove(board, playerID) {
    return board.workers.filter((w) => w.player === playerID).every((w) => {
      return this.checkBoxedIn(w, board);
    });
  }

  // Sees if the unoccupied tiles around the player are all too high.
  // Worker Board -> Boolean
  checkBoxedIn(worker, board) {
    return this.getAdjacentTiles(worker, board).every((h) => {
      return h - board.heightAtTile(worker.posn.x, worker.posn.y) > c.MAX_FLOORS_PER_MOVE;
    });
  }

  // Returns an array of unoccupied tile heights adjacent to the given worker.
  // Worker Board -> Boolean
  getAdjacentTiles(worker, board) {
    let adjArr = [];

    for (let d in dirs) {
      let newX = dirs[d].x + worker.posn.x;
      let newY = dirs[d].y + worker.posn.y;

      if (this.checkValid(board, worker, direction.coordToDirection(dirs[d]))) {
        adjArr.push([newX, newY]);
      }
    }

    return adjArr.map((e) => board.heightAtTile(e[0], e[1]));
  }
}

module.exports = Rulechecker;