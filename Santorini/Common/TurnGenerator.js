/*
  This module contains two exposed classes, a TurnGenerator and a MoveGenerator,
  that take in a GameState and produce all valid Turns and MoveActions, respectively,
  that can be taken by the current player (whose turn it is) in the generator's GameState.

  They provide an iterator-like interface of next() and hasNext(),
  allowing users of this TurnGenerator/MoveGenerator to smartly iterate through
  the possible Turns/MoveActions and stop generating new Turns/MoveActions at any time.

  The MoveGenerator is exposed to enable users to search only for
  winning moves, if they wish. However, it returns all possible
  moves in its GameState, not just winning moves.

  The BuildGenerator class is only used internally by the TurnGenerator.

  ---- Data Definitions -----

  The data definitions for Actions are in Action.js
  The data definition for a Turn is in Action.js.
  The data definition for a PlayerId is in GameState.js

 */
const Direction = require('./Direction.js');
const DIRS = Direction.MOVEMENT_DIRECTIONS;
const Action = require('./Action.js');
const MoveAction = Action.MoveAction;
const BuildAction = Action.BuildAction;

const RuleChecker = require('./RuleChecker.js');

/* TurnGenerator
  When constructed with a GameState where it is some player's turn,
  produce all possible valid Turns that that player could take in the game.

  First produces all valid move-only Turns (winning moves),
  then produces all valid move-build Turns.
 */
class TurnGenerator {

  constructor(gameState) {
    this.gameState = gameState;
    this.nextTurn = null;

    this.moveToWinGenerator = new MoveGenerator(this.gameState);
    this.moveGenerator = new MoveGenerator(this.gameState);
    this.buildGenerator = null;

    this.currentMove = null;

  }

  /* Void -> Boolean
    Return true if there is another Turn that the player could take in the game.
    Sets that turn in the nextTurn field for return by the next() method.
   */
  hasNext() {
    // Return true if user hasn't retrieved the next turn with next() yet
    if (this.nextTurn !== null) {
      return true;
    }

    // First, find all winning moves
    while (this.moveToWinGenerator.hasNext()) {
      let turn = [this.moveToWinGenerator.next()];
      if (RuleChecker.validateTurn(this.gameState, turn)) {
        this.nextTurn = turn;
        return true;
      }
    }
    // Then, find all valid move-build Turns.
    while (this.moveGenerator.hasNext() || (this.buildGenerator && this.buildGenerator.hasNext())) {
      while (this.buildGenerator && this.buildGenerator.hasNext()) {
        let turn = [this.currentMove, this.buildGenerator.next()];
        if (RuleChecker.validateTurn(this.gameState, turn)) {
          this.nextTurn = turn;
          return true;
        }
      }
      // Get the next move from MoveGenerator, store it for use in making Turns,
      // and make a BuildGenerator that finds all valid Builds in the
      // game state where the move has been executed.
      let gameStateAfterMove = this.gameState.copy();
      this.currentMove = this.moveGenerator.next();
      Action.execute(this.currentMove, gameStateAfterMove);
      this.buildGenerator = new BuildGenerator(gameStateAfterMove, this.currentMove.getWorkerId());
    }
    return false;
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

  /* GameState WorkerId -> BuildGenerator
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
  Pop the most recent action found by this BuildGenerator.
  Invalid to call without first checking that hasNext() returns true.
   */
  next() {
    let action = this.nextAction;
    this.nextAction = null;
    this.incrementDirectionIndex();
    return action;
  }

  /* Void -> Void
    Internal method to increment direction index used to make moves.
   */
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
  Internal method.
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
  "TurnGenerator": TurnGenerator,
  "MoveGenerator": MoveGenerator
};