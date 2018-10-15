/*
  This module contains two classes, a TurnGenerator and a MoveGenerator,
  that take in a GameState and produce all valid Turns or Moves, respectively,
  that can be taken by the current player (whose turn it is) in the GameState.

  It provides an iterator-like interface of next() and hasNext(),
  allowing clients of this TurnGenerator to smartly iterate through
  the possible Turns and stop generating new Turns at any time.

  ---- Data Definitions -----

  The data definition for a Turn is in Action.js.

  The data definition for a PlayerId is in GameState.js

 */
const Direction = require('./Direction.js');
const DIRS = Direction.MOVEMENT_DIRECTIONS;
const Action = require('./Action.js');
const MoveAction = Action.MoveAction;
const BuildAction = Action.BuildAction;

const RuleChecker = require('./RuleChecker.js');

/*
Given a GameState where it is a player's turn, produce all possible Turns
that the player could take, using any of its workers on the board.

 */
class TurnGenerator {

  constructor(gameState) {
    this.gameState = gameState;
    this.whoseTurn = gameState.getWhoseTurn();
    this.workerList = gameState.getWorkerList(this.whoseTurn);
    this.workerIndex = 0;

    this.nextTurn = null;

    this.moveGenerator = new MoveGenerator(this.gameState);
    this.buildGenerator = null;

  }

  /* Void -> Boolean

   */
  hasNext() {
    // Return true if we haven't retrieved the next turn with next() yet
    if (this.nextTurn !== null) { return true; }

    if (!this.moveGenerator.hasNext()) {
      return false;
    }

    // A null build generator signifies that we are starting from a new move.
    if (this.buildGenerator === null) {
      // If no next move for current worker, then increment worker index.
      let action = this.moveGenerator.peek();
      let moveLoc = action.getLoc();

      // Since we have not yet checked this next move for a win,
      // check for win now, and if win, then pop the move,
      // set it as the Turn + return.
      if (this.gameState.getBoard().getHeight(moveLoc[0], moveLoc[1]) === RuleChecker.WINNING_HEIGHT) {
        this.nextTurn = [this.moveGenerator.next()];
        return true;
      }
      // If the move is not a win, then we can generate all the Move+Build turns from it.
      else {
        let gameStateAfterMove = this.gameState.copy();
        Action.execute(action, gameStateAfterMove);
        this.buildGenerator = new BuildGenerator(gameStateAfterMove, this.moveGenerator.getCurrentWorkerId());
      }
    }

    // Now we have a move gen and a build gen.

    // If build gen has next, pop + return.
    if (this.buildGenerator.hasNext()) {
      this.nextTurn = [this.moveGenerator.peek(), this.buildGenerator.next()];
      return true;
    }
    // Else, build gen = null, pop move + return hasNext().
    else {
      this.buildGenerator = null;
      this.moveGenerator.next();
      return this.hasNext();
    }
  }

  /* Void -> Turn
  Return the next valid Turn that this Generator has found.
  Invalid to call without first checking that hasNext() returns true.
   */
  next() {
    let turn = this.nextTurn;
    this.nextTurn = null;
    return turn;
  }
}

/*
Iterator that generates all <=8 possible BuildActions for a player in a gamestate.
 */
class BuildGenerator {

  /* GameState -> BuildGenerator
  Produce a BuildGenerator that iterates over all valid BuildActions
  that can be taken from the given GameState, by the given worker.

  The worker must belong to the player whose turn it is in the GameState.
   */
  constructor(gameState, workerId) {
    this.gameState = gameState;
    this.whoseTurn = gameState.getWhoseTurn();
    this.workerId = workerId;
    this.nextAction = null;
    this.directionIndex = 0;
  }

  /* Void -> Boolean
  Returns true if there exists another valid MoveAction that can be
  taken that has not yet been returned by this MoveGenerator.

  A false result means there are no more valid BuildActions that can be
  taken by this BuildGenerator's worker on the GameState it was constructed with.
   */
  hasNext() {
    // Don't get the next action until the most recently found one has been used.
    if (this.nextAction != null) {
      return true;
    }
    if (this.directionIndex >= DIRS.length) {
      return false;
    }
    let workerLocation = this.gameState.getBoard().getWorker(this.workerId);
    let buildLocation = Direction.adjacentLocation(workerLocation, DIRS[this.directionIndex]);
    let buildAction = new BuildAction(this.workerId, buildLocation);

    // Validate the build action, call hasNext again if not a valid move.
    if (RuleChecker.validate(this.gameState, buildAction, this.whoseTurn)) {
      this.nextAction = buildAction;
      return true;
    } else {
      this.incrementDirectionIndex();
      return this.hasNext();
    }
  }

  /* Void -> BuildAction
  Return the next action found, without mutating this Iterator.
  Invalid to call without first checking that hasNext() returns true.
   */
  peek() {
    return this.nextAction;
  }

  /* Void -> BuildAction
  Pop the most recent action found by this BuildGenerator.
  Invalid to call without first checking that hasNext() returns true.
   */
  next() {
    let action = this.nextAction;
    this.nextAction = null;
    this.incrementDirectionIndex();
    return action;
  }

  incrementDirectionIndex() {
    this.directionIndex += 1;
  }
}

/*
Iterator that generates all <=16 possible valid MoveActions for a player
in a GameState (all moves that can be made by either worker).
 */
class MoveGenerator {
  /* GameState -> MoveGenerator
  Produces a MoveGenerator that iterates over all valid MoveActions
  that can be taken from the given GameState, by any Worker belonging
  to the player
 */
  constructor(gameState) {
    this.gameState = gameState;
    this.whoseTurn = gameState.getWhoseTurn();
    this.workerList = gameState.getWorkerList(this.whoseTurn);
    this.nextAction = null;
    this.workerIndex = 0;
    this.directionIndex = 0;
  }

  /* Void -> Boolean
  Returns true if there exists another valid MoveAction that can be
  taken that has not yet been returned by this MoveGenerator.
   */
  hasNext() {
    if (this.nextAction !== null) {
      return true;
    }
    // must check if the worker index is too high (implying that all possible moves have been checked)
    if (this.workerIndex >= this.workerList.length) {
      return false;
    }

    let workerId = this.workerList[this.workerIndex];
    let workerLocation = this.gameState.getBoard().getWorker(workerId);
    let moveLocation = Direction.adjacentLocation(workerLocation, DIRS[this.directionIndex]);
    let moveAction = new MoveAction(workerId, moveLocation);

    // Validate the move action, call hasNext again if not a valid move.
    if (RuleChecker.validate(this.gameState, moveAction, this.whoseTurn)) {
      this.nextAction = moveAction;
      return true;
    } else {
      this.incrementDirectionIndex();
      return this.hasNext();
    }
  }

  /* Void -> MoveAction
  Return the next action found, without mutating this Iterator.
  Invalid to call without first checking that hasNext() returns true.
  */
  peek() {
    return this.nextAction;
  }

  /* Void -> WorkerId
  Get the ID of the worker whose moves are currently being generated.
   */
  getCurrentWorkerId() {
    return this.workerList[this.workerIndex];
  }

  /* Void -> MoveAction
    Returns the next MoveAction that has been found by hasNext().
    Invalid to call this method without first calling
    hasNext() and getting back a value of true.

    Pops the next action stored in this class, and increments the
    direction index so that hasNext finds the right next move.
   */
  next() {
    let action = this.nextAction;
    this.nextAction = null;
    this.incrementDirectionIndex();
    return action;
  }

  /* Void -> Void
  Increments the move index, increasing its value by one.

  If the move index is outside the range of the list of directions,
  it rolls over and the worker index is incremented.

  There are no guarantees that the worker index is within bounds.
 */
  incrementDirectionIndex() {
    this.directionIndex += 1;
    if (this.directionIndex >= DIRS.length) {
      this.directionIndex = 0;
      this.workerIndex += 1;
    }
  }
}



module.exports = {
  "TurnGenerator" : TurnGenerator,
  "MoveGenerator" : MoveGenerator,
  "BuildGenerator" : BuildGenerator
};