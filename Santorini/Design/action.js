/*
This file represents all possible actions that can be taken on a Board.
This is an interface that has not been fully implemented.

Action represents the things a player can do to affect the state of the board.
Action is one of 3 classes:
- PlaceAction
- MoveAction
- BuildAction

They can all execute themselves on a Board, given a Board (meaning they will
mutate the given Board appropriately). The execute method returns the result of
that execution, if there is one.
*/

/* Superclass for all actions that can be taken on a board. Invalid on its own.
Subclasses should contain all necessary data to execute themselves on a Board,
Given a Board instance, they can do so on that Board, returning any result
produced by the Board. */
class Action {
  constructor(playerId) {
    this.playerId = playerId;
  }
  execute(board) { throw 'must define execute() in subclass'; }
  getType() { throw 'must define type() in subclass'; }
}

/* Represents the action of placing a worker on a board at a location.
execute() returns the WorkerId created by the Board. */
class PlaceAction extends Action {
  constructor(playerId, loc) {
    super(playerId);
    this.loc = loc;
  }

  /* call addWorker() on the board, return resulting WorkerId */
  // TODO
  execute(board) {}

  /* Return this Action's type */
  getType() { return "place"; }

  /* Returns the location at which this Place will occur */
  getLoc() { return this.loc; }
}

/* Represents the action of moving a worker to a location on a board. */
class MoveAction extends Action {
  constructor(playerId, workerId, loc) {
    super(playerId);
    this.loc = loc;
    this.workerId = workerId;
  }

  /* call moveWorker() on the board, return nothing */
  // TODO
  execute(board) {}

  /* Return this Action's type */
  getType() { return "move"; }

  /* Returns the location to which this Move will occur */
  getLoc() { return this.loc; }

  /* Returns the ID of the worker making this Move */
  getWorkerId() { return this.workerId; }
}

/* Represents the action of a worker building a floor at a location on a board. */
class BuildAction extends Action {
  constructor(playerId, workerId, loc) {
    super(playerId);
    this.loc = loc;
    this.workerId = workerId;
  }

  /* call buildFloor() on the board, return nothing */
  // TODO
  execute(board) {}

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
