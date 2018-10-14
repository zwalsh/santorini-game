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

class TurnGenerator {
  /* GameState -> TurnGenerator
    Produces a TurnGenerator that iterates over all valid Turns
    that can be taken from the given GameState.
   */
  constructor(gameState) {
    this.gameState = gameState;
    this.whoseTurn = gameState.getWhoseTurn();
    this.workerList = gameState.getWorkerList(this.whoseTurn);
    this.nextTurn = null;
    this.workerIndex = 0;
    this.moveDirectionIndex = 0;
    this.buildDirectionIndex = 0;
    this.gameStatePostMove = null;
  }

  /* Void -> Boolean
    Returns true if there is another valid Turn that can be
    taken that has not yet been returned by this TurnGenerator.

    hasNext determines and set the next turn on this
    TurnGenerator, if a valid next turn exists.
   */
  hasNext() {
    // must check if the worker index is too high (implying that all possible moves have been checked)
    if (this.workerIndex >= this.workerList.length) {
      return false;
    }
    let workerId = this.workerList[this.workerIndex];
    let workerLocation = this.gameState.getBoard().getWorker(workerId);
    let moveLocation = Direction.adjacentLocation(workerLocation, DIRS[this.moveDirectionIndex]);
    let moveAction = new MoveAction(workerId, moveLocation);

    let buildLocation = Direction.adjacentLocation(moveLocation, DIRS[this.buildDirectionIndex]);
    let buildAction = new BuildAction(workerId, buildLocation);

    // If we have not yet checked the move for the current move index,
    // validate that move, and store a copy of the game state with
    // that move executed on it.
    if (this.gameStatePostMove === null) {
      // validate if/else increment  in  else  case
      if (RuleChecker.validate(this.gameState, moveAction, this.whoseTurn)) {
        let gsCopy = this.gameState.copy();
        Action.execute(moveAction, gsCopy);
        this.gameStatePostMove = gsCopy;
      } else {
        this.incrementMoveIndex();
        return this.hasNext();
      }
    }

    // check if won - if so, increment, set move, return true
    let newWorkerHeight = this.gameStatePostMove.getBoard().getHeight(moveLocation[0], moveLocation[1]);
    if (newWorkerHeight === RuleChecker.WINNING_HEIGHT) {
      this.nextTurn = [moveAction];
      this.incrementMoveIndex();
      return true;
    }

    // check build
    if (RuleChecker.validate(this.gameStatePostMove, buildAction, this.whoseTurn)) {
      // if valid, increment, set move, return true
      this.nextTurn = [moveAction, buildAction];
      this.incrementBuildIndex();
      return true;
    } else {
      // if invalid, increment and call has next
      this.incrementBuildIndex();
      return this.hasNext();
    }

  }

  /* Void -> Void
    Increments the build index, increasing its value by one.
    If the build index is too high, the move index is incremented instead
    (rolling the build index over, back to 0).
   */
  incrementBuildIndex() {
    this.buildDirectionIndex += 1;
    if (this.buildDirectionIndex >= DIRS.length) {
      this.incrementMoveIndex();
    }
  }

  /* Void -> Void
    Increments the move index, increasing its value by one.
    Sets the build index back to zero, as we are considering
    an entirely new set of possible builds after the new movement.

    If the move index is too high, it rolls over and the worker
    index is incremented. There are no guarantees that the
    worker index is within bounds.
   */
  incrementMoveIndex() {
    this.buildDirectionIndex = 0;
    this.moveDirectionIndex += 1;
    this.gameStatePostMove = null;
    if (this.moveDirectionIndex >= DIRS.length) {
      this.moveDirectionIndex = 0;
      this.workerIndex += 1;
    }
  }

  /* Void -> Turn
    Returns the next turn that has been found by hasNext().
    Invalid to call this method without first calling
    hasNext() and getting back a value of true.
   */
  next() {
    return this.nextTurn;
  }
}

/*
Class that generates all 8 possible moves for a player in a gamestate
 */
class MoveGenerator {
  /* GameState -> TurnGenerator
  Produces a TurnGenerator that iterates over all valid Turns
  that can be taken from the given GameState.
 */
  constructor(gameState) {
    this.gameState = gameState;
    this.whoseTurn = gameState.getWhoseTurn();
    this.workerList = gameState.getWorkerList(this.whoseTurn);
    this.nextMove = null;
    this.workerIndex = 0;
    this.moveDirectionIndex = 0;
  }

  /* Void -> Boolean
  Returns true if there exists another valid MoveAction that can be
  taken that has not yet been returned by this MoveGenerator.
   */
  hasNext() {
    // must check if the worker index is too high (implying that all possible moves have been checked)
    if (this.workerIndex >= this.workerList.length) {
      return false;
    }

    let workerId = this.workerList[this.workerIndex];
    let workerLocation = this.gameState.getBoard().getWorker(workerId);
    let moveLocation = Direction.adjacentLocation(workerLocation, DIRS[this.moveDirectionIndex]);
    let moveAction = new MoveAction(workerId, moveLocation);

    // Validate the move action, call hasNext again if not a valid move.
    if (RuleChecker.validate(this.gameState, moveAction, this.whoseTurn)) {
      this.nextMove = moveAction;
    } else {
      this.incrementMoveIndex();
      return this.hasNext();
    }
  }

  /* Void -> MoveAction
    Returns the next MoveAction that has been found by hasNext().
    Invalid to call this method without first calling
    hasNext() and getting back a value of true.
   */
  nextMove() {
    return this.nextMove;
  }

  /* Void -> Void
  Increments the move index, increasing its value by one.

  If the move index is outside the range of the list of directions,
  it rolls over and the worker index is incremented.

  There are no guarantees that the worker index is within bounds.
 */
  incrementMoveIndex() {
    this.moveDirectionIndex += 1;
    if (this.moveDirectionIndex >= DIRS.length) {
      this.moveDirectionIndex = 0;
      this.workerIndex += 1;
    }
  }

}

module.exports = {
  "TurnGenerator" : TurnGenerator,
  "MoveGenerator" : MoveGenerator
};