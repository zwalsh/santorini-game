/*
This file represents all possible actions that can be taken on a GameState.
This is an interface that has not been fully implemented.

Action represents the things a player can do to affect the state of the game.
Action is one of 3 classes:
- PlaceAction
- MoveAction
- BuildAction

They can all execute themselves on a GameState (meaning they will
mutate the given GameState appropriately).

GameState is defined in GameState.js
*/

/* Superclass for all actions that can be taken on a GameState. Invalid on its
own. Subclasses should contain all necessary data to execute themselves on
a GameState, given a GS instance. */
class Action {
  constructor() {}
  execute(gameState) { throw 'must define execute() in subclass'; }
  getType() { throw 'must define type() in subclass'; }
}

/* Represents the action of placing a worker on a board at a location. */
class PlaceAction extends Action {
  constructor(loc) {
    this.loc = loc;
  }

  /* call addWorker() on the board, update the worker ownerships, change
  whose turn it is. */
  // TODO
  execute(gameState) {}

  /* Return this Action's type */
  getType() { return "place"; }

  /* Returns the location at which this Place will occur */
  getLoc() { return this.loc; }
}

/* Represents the action of moving a worker to a location on a board. */
class MoveAction extends Action {
  constructor(workerId, loc) {
    this.loc = loc;
    this.workerId = workerId;
  }

  /* call moveWorker() on the board */
  // TODO
  execute(gameState) {}

  /* Return this Action's type */
  getType() { return "move"; }

  /* Returns the location to which this Move will occur */
  getLoc() { return this.loc; }

  /* Returns the ID of the worker making this Move */
  getWorkerId() { return this.workerId; }
}

/* Represents the action of a worker building a floor at a location on a board. */
class BuildAction extends Action {
  constructor(workerId, loc) {
    this.loc = loc;
    this.workerId = workerId;
  }

  /* call buildFloor() on the board, change whose turn it is */
  // TODO
  execute(gameState) {}

  /* Return this Action's type */
  getType() { return "build"; }

  /* Returns the location at which this Build will occur */
  getLoc() { return this.loc; }

  /* Returns the ID of the worker building this floor */
  getWorkerId() { return this.workerId; }
}

module.exports = {
  "PlaceAction" : PlaceAction,
  "MoveAction" : MoveAction,
  "BuildAction" : BuildAction
}
