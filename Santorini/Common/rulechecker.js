const direction = require('./direction');
const dirs = direction.directions;
const constants = require('./constants');

/**
 * Data Definitions:
 *
 * WorkerRequest, PlaceRequest, MoveRequest, BuildRequest, and Turn
 *  are defined in Common/player-interface.js
 *
 * Height and InitWorker are defined in board.js
 *
 * Direction is defined in direction.js
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
    return x >= 0 && x < constants.BOARD_WIDTH && y >= 0 && y < constants.BOARD_HEIGHT;
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
    let isMoveToWinningHeight = board.workerNeighborHeight(workerReq, moveDir) === constants.WINNING_HEIGHT;
    if (turn.length === 1) {
      return isMoveToWinningHeight;
    }
    let buildDir = turn[1][1];
    let boardAfterMove = board.copy();
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
          board.workerNeighborHeight(workerRequest, ["PUT", "PUT"]) <= constants.MAX_FLOORS_PER_MOVE) {
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
    let clone = board.copy();

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
  // - WorkerRequest is valid in the given Board
  // - Target tile is not current workers own tile
  // - Target tile is a tile in-bounds
  // - Target tile is not occupied by another worker
  // - Target tile is less than max height
  // Board WorkerRequest Direction -> Boolean
  checkValid(board, workerRequest, direction) {
    if (this.checkValidWorkerRequest(board, workerRequest)) {
      if (direction.join('') !== "PUTPUT") {
        if (board.workerHasNeighbor(workerRequest, direction)) {
          if (!board.workerNeighborIsOccupied(workerRequest, direction)) {
            if (board.workerNeighborHeight(workerRequest, direction) < constants.MAX_HEIGHT) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  /* Board WorkerRequest -> Boolean
    Does the given Board contain the worker denoted by the WorkerRequest?
    The named player exists in the game, and it has a worker with the ID in the request.
   */
  checkValidWorkerRequest(board, workerRequest) {
    let workers = board.getWorkers();
    return workers.some((worker) => {
      return worker.player === workerRequest.player &&
        worker.id === workerRequest.id;
    });
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
      return board.heightAtTile(w.posn.x, w.posn.y) === constants.MAX_HEIGHT - 1;
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
      return h - board.heightAtTile(worker.posn.x, worker.posn.y) > constants.MAX_FLOORS_PER_MOVE;
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