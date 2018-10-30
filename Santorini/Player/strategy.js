const c = require('../Lib/constants');
const dirs = require('../Lib/direction');
const Rulechecker = require('../Common/rulechecker');

/**
 * Data Definitions:
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
 * Init workers come from the referee on startup of the game.
 *
 */

// Interface for planning actions for the Player. Can be represented by an AI or simply a human at a keyboard.
class Strategy {
  // String String Int Int-> Strategy
  constructor (playerID, opponentID, maxLookahead, placementStrategy) {
    this.playerID = playerID;

    this.opponentID = opponentID;

    this.ruleChecker = new Rulechecker();

    this.maxLookahead = maxLookahead;

    // 0 is diagonal strategy, 1 is max distance strategy
    if (placementStrategy !== 0 && placementStrategy !== 1) throw 'Invalid placement strategy';
    this.placementStrategy = placementStrategy;
  }

  // Retrieve the desired coordinates for placement of workers during the setup phase.
  // ListOfInitWorker -> PlaceRequest
  getNextWorkerPlace(workerList) {
    if (this.placementStrategy === 0) {
      return this.getNextWorkerPlaceDiagonal(workerList);
    } else if (this.placementStrategy === 1) {
      return this.getNextWorkerPlaceDistance(workerList);
    }
  }

  // Retrieve the desired coordinates for placement of workers during the setup phase
  // determined by placement on a board diagonal.
  // ListOfInitWorker -> PlaceRequest
  getNextWorkerPlaceDiagonal(workerList) {
    for (let i = 0; i < c.BOARD_HEIGHT; i++) {
      let p = {x:i, y:i};
      if (!this.tileIsOccupied(workerList, p)) {
        return ["place", p.x, p.y];
      }
    }
  }

  // Retrieve the desired coordinates for placement of workers during the setup phase determined my distance
  // from opponent workers.
  // ListOfInitWorker -> PlaceRequest
  getNextWorkerPlaceDistance(workerList) {
    if (workerList.length === 0) {
      return ["place", 0, 0];
    }

    let opponentWorkers = workerList.filter((w) => w.player !== this.playerID);
    let unoccupiedTiles = [];
    let posnToDistanceTable = new Map();

    //get array of possible unoccupied posns
    for (let i = 0; i < c.BOARD_WIDTH; i++) {
      for(let j = 0; j < c.BOARD_HEIGHT; j++) {
        let posn = {x:i, y:j};
        if (!this.tileIsOccupied(workerList, posn)) unoccupiedTiles.push(posn);
      }
    }

    // table of {posn, distance}
    unoccupiedTiles.forEach((t) => {
      let totalX = 0;
      let totalY = 0;
      opponentWorkers.forEach((iw) => {
        totalX += iw.x;
        totalY += iw.y;
      });
      let avgX = totalX / opponentWorkers.length;
      let avgY = totalY / opponentWorkers.length;
      let distanceFromUnoccupied = Math.sqrt(Math.pow((avgX - t.x), 2) + Math.pow((avgY - t.y), 2));

      posnToDistanceTable.set(t, distanceFromUnoccupied);
    });

    // extract posn with max distance
    let maxPosn = null;
    let tempMaxDistance = 0;
    posnToDistanceTable.forEach((value, key) => {
      if (value > tempMaxDistance) {
        tempMaxDistance = value;
        maxPosn = key;
      }
    });

    return ["place", maxPosn.x, maxPosn.y];
  }

  // Checks if the given posn is occupied by a worker in the workerList
  // ListOfInitWorkers Posn -> Boolean
  tileIsOccupied(workerList, posn) {
    return workerList.some(function (iw) {
      return iw.x === posn.x && iw.y === posn.y;
    });
  }

  // Determines the next move and build requests from the Board
  // Board -> Turn
  getNextTurn(board) {
    // all possible turns this player can take (where Turn is only [move, build])
    let decisions = this.genDecisions(board, this.playerID);

    let decisionFound;
    let decToMake;

    // while we have not found a viable turn and can still look ahead further
    // where one is base case
    while (!decisionFound && this.maxLookahead !== 1) {

      // find one where the decision keeps you alive
      decisionFound = decisions.some((d) => {
        if (this.decisionKeepsAlive(board, this.maxLookahead, this.playerID, d)) {
          decToMake = d;
          return true;
        } else return false;
      });

      if (!decisionFound) this.maxLookahead--;
    }

    // A loss is inevitable. No move keeps us alive within the next round, so we must pick a decision and just end ourselves :(
    if (!decisionFound && this.maxLookahead === 1) {
      decToMake = decisions[0];
    }

    return decToMake;
  }

  // Returns the given player's opponent ID. For example, if we give it our opponent's player ID, it will return
  // this Strategy's player ID
  // String -> String
  otherPlayer(p) {
    if (p === this.playerID) {
      return this.opponentID;
    } else {
      return this.playerID;
    }
  }

  // See if we are guaranteed to be alive after the given number of turns.
  // Board Int String -> Boolean

  // is this strategy's player alive given that it's the given Player's turn?
  aliveAfterLookahead(board, lookahead, playerID) {
    // A lookahead of 0 means we just see if we are still alive at the given game state.
    if (lookahead === 0) {
      // todo this is a wrong assumption - if it's not this Player's turn, it's not time to check if we're still alive
      return this.isStillAlive(board);
    } else {
      // todo check if won first, don't genDecisions
      // decisions for the player whose turn it is
      let decisions = this.genDecisions(board, playerID);

      // Check to see if there are any decisions to be made.
      if (decisions.length !== 0) {
        // this should also be dependent on whose turn it is - every vs. some
        // currently checks that every single decision the current player makes keeps this strategy's player alive
        return this.isStillAlive(board) && decisions.every((d) => this.decisionKeepsAlive(board, lookahead, playerID, d));
      } else {
        return this.isStillAlive(board);
      }
    }
  }

  // > Sees if the given decision will keep this Strategy's Player alive in the given number of rounds.
  // Board Int String Turn -> Boolean

  // does the given decision keep the given player alive?
  decisionKeepsAlive (board, lookahead, playerID, decision) {

    // returns true if the other player is alive given that turn with one less lookahead?
    // should maybe be if the other player can win after that decision in the given lookahead
    return this.aliveAfterLookahead(this.applyDecision(board, decision), lookahead - 1, this.otherPlayer(playerID));
  }


  // Determine if this strategy's Player is still alive on the given board.
  // Board -> Boolean
  isStillAlive(board) {
    // todo should we check if playerId has won here?
    // this is dependent on whose turn it is, but that info is not passed in here
    // what is this method actually checking?
    // either: we are at a winning height, the opponent is at a winning height, or we cannot move
    // todo this is a bug (or where it's called) - more nuanced def of still alive than this
    return (this.ruleChecker.hasWon(board, this.playerID) || !this.ruleChecker.hasLost(board, this.playerID))
        && !this.ruleChecker.hasWon(board, this.opponentID);
  }

  // Generate all the possible valid decisions that the given player can make at the given board state.
  // Board String -> Listof Turn
  genDecisions(board, playerID) {
    let decisions= [];

    // See if the given player has already lost so we don't have to check any decisions at all.
    // Really only necessary to do this for the opponent player because if we lose it is caught by isStillAlive first.
    if (!this.ruleChecker.hasLost(board, playerID)) {
      // Operate on only the given player's workers
      board.getWorkers().filter((w) => w.player === playerID).forEach((w) => {
        let wRequest = {player: w.player, id: w.id};

        // Iterate through all possible combinations of Move Direction and Build Direction
        for (let moveCoord in dirs.directions) {
          let moveDir = dirs.coordToDirection(dirs.directions[moveCoord]);
          if (board.workerHasNeighbor(wRequest, moveDir) &&
            board.workerNeighborHeight(wRequest, moveDir) === c.WINNING_HEIGHT) {
            decisions.push([["move", wRequest, moveDir]]);
            continue;
          }
          // todo use checkTurn and add just the move to the list of decisions
          for (let buildCoord in dirs.directions) {
            let buildDir = dirs.coordToDirection(dirs.directions[buildCoord]);
            // todo this could also be checkTurn
            if (this.ruleChecker.isValidMoveBuild(board, wRequest, moveDir, buildDir)) {
              decisions.push([["move", wRequest, moveDir], ["build", buildDir]]);
            }
          }
        }
      });
    }
    return decisions;
  }

  // Given a valid decision to be made, make a copy of the board and apply the decision to it.
  // Board Turn -> Board
  applyDecision(board, decision) {
    let wReq;
    let newBoard = board.copy();

    decision.forEach((d) => {
      if (d[0] === "move") {
        wReq = d[1];
        newBoard.moveWorker(wReq, d[2]);
      } else {
        // Need to check if the build is valid. A MoveBuild can be valid if the Move leads to a win, but the subsequent
        // Build may not be valid so we must check it.
        if (this.ruleChecker.isValidBuild(newBoard, wReq, d[1])) {
          newBoard.buildWithWorker(wReq, d[1]);
        }
      }
    });

    return newBoard;
  }
}

module.exports = Strategy;