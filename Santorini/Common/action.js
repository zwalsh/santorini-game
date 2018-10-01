/*
This file represents all possible actions that can be taken on a Board.

Action represents the things a player can do to affect the state of the board.
Action is one of 3 classes:
Place (Place-Action? naming convention tbd)
Move
Build

They can all execute themselves on a Board, given a Board
  (execute = call the appropriate method on board)
  - Execute method returns the result of that execution: [nothing] or WorkerId
They all need PlayerId
They can all provide their type as a string: "move", "build", "place"

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
  type() { throw 'must define type() in subclass'; }
}

/* Represents the action of placing a worker on a board at a location.
execute() returns the WorkerId created by the Board. */
class Place extends Action {
  constructor(playerId, loc) {
    super(playerId);
    this.loc = loc;
  }

  /* call addWorker() on the board, return resulting WorkerId */
  // TODO
  execute(board) {}

  /* Return this Action's type */
  type() { return "place"; }
}

/* Represents the action of moving a worker to a location on a board. */
class Move extends Action {
  constructor(playerId, workerId, loc) {
    super(playerId);
    this.loc = loc;
    this.workerId = workerId;
  }

  /* call moveWorker() on the board, return nothing */
  // TODO
  execute(board) {}

  /* Return this Action's type */
  type() { return "move"; }
}

/* Represents the action of a worker building a floor at a location on a board. */
class Build extends Action {
  constructor(playerId, workerId, loc) {
    super(playerId);
    this.loc = loc;
    this.workerId = workerId;
  }

  /* call buildFloor() on the board, return nothing */
  // TODO
  execute(board) {}

  /* Return this Action's type */
  type() { return "build"; }
}

module.exports = {
  "Place" : Place,
  "Move" : Move,
  "Build" : Build
}
