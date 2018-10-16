/*
  This file represents all possible actions that can be taken on a GameState.

  Action represents the things a player can do to affect the state of the game.
  Action is one of 3 classes:
  - PlaceAction
  - MoveAction
  - BuildAction

  Actions are simply units of data that can be passed around the program.
  Operations involving Actions, such as copying or executing them, are
  located in this module, since it would not be secure to rely on
  execution or copying functions associated with an Action object coming from
  an outside source.

  Actions will commonly be paired in Turns.
  A Turn is one of:
    - [MoveAction]
    - [MoveAction, BuildAction]

  Where a single MoveAction is only a valid Turn if it results in an
  end-game condition. It represents the whole Turn for a Player.


  The functions execute() and copy() are exported as part of this module
  in order to facilitate:
    1. executing an action on a GameState and
    2. making a deep copy of an Action

  GameState is defined in GameState.js
  Location is a 2-element array [row,col], where
  - row is a row index on a Board
  - col is a col index on a Board
*/

const PLACE = "place";
const MOVE = "move";
const BUILD = "build";

/* Action -> Action
Make a deep copy of the Action.
*/
function copy(action) {
  switch (action.getType()) {
    case PLACE:
      return copyPlace(action);
    case MOVE:
      return copyMove(action);
    case BUILD:
      return copyBuild(action);
    default: throw `Unsupported action type: ` + action.getType();
  }
}

/* Return a deep copy of the given PlaceAction. */
function copyPlace(action) { 
  return new PlaceAction([action.getLoc()[0], action.getLoc()[1]]) 
}

/* Return a deep copy of the given MoveAction. */
function copyMove(action) { 
  return new MoveAction(action.getWorkerId(), [action.getLoc()[0], action.getLoc()[1]]) 
}

/* Return a deep copy of the given BuildAction. */
function copyBuild(action) { 
  return new BuildAction(action.getWorkerId(), [action.getLoc()[0], action.getLoc()[1]]) 
}

/* Action GameState -> Void
Execute the given action on the given BoardState.
*/
function execute(action, gameState) {
  switch (action.getType()) {
    case PLACE:
      executePlace(action, gameState);
      break;
    case MOVE:
      executeMove(action, gameState);
      break;
    case BUILD:
      executeBuild(action, gameState);
      break;
    default: throw `Unsupported action type: ` + action.getType();
  }
}

/* PlaceAction GameState -> Void
Add a Worker to the GameState's Board, update the GameState's worker 
ownerships, and change whose turn it is. 
Update the GameState's last action to the given action.
*/
function executePlace(action, gameState) {
  let loc = action.getLoc();
  let x = loc[0];
  let y = loc[1];
  let workerId = gameState.getBoard().addWorker(x, y);
  let currentPlayerId = gameState.getWhoseTurn();
  gameState.addOwnership(workerId, currentPlayerId);
  gameState.setLastAction(action);
  gameState.flipTurn();
}

/* MoveAction GameState -> Void
Move a worker on the GameState's Board. 
Update its last action to the given action.
*/
function executeMove(action, gameState) {
  let loc = action.getLoc();
  let x = loc[0];
  let y = loc[1];
  gameState.getBoard().moveWorker(action.getWorkerId(), x, y);
  gameState.setLastAction(action);
}

/* BuildAction GameState -> Void
Build with a worker on the GameState's Board. 
Update its last action to the given action.
*/
function executeBuild(action, gameState) {
  let loc = action.getLoc();
  let x = loc[0];
  let y = loc[1];
  gameState.getBoard().buildFloor(action.getWorkerId(), x, y);
  gameState.flipTurn();
  gameState.setLastAction(action);
}

/* Represents the action of placing a worker on a board at a location. 
Contains all data needed to execute itself on a GameState, when given one. */
class PlaceAction {
  /* Location -> PlaceAction */
  constructor(loc) {
    this.loc = loc;
  }

  /* Return this Action's type */
  getType() { return PLACE; }

  /* Returns the location at which this Place will occur */
  getLoc() { return this.loc; }
}

/* Represents the action of moving a worker to a location on a board.
Contains all data needed to execute itself on a GameState, when given one.  */
class MoveAction {

  /* WorkerId Location -> MoveAction */
  constructor(workerId, loc) {
    this.loc = loc;
    this.workerId = workerId;
  }

  /* Return this Action's type */
  getType() { return MOVE; }

  /* Returns the location to which this Move will occur */
  getLoc() { return this.loc; }

  /* Returns the ID of the worker making this Move */
  getWorkerId() { return this.workerId; }
}

/* Represents the action of a worker building a floor at a location on a board. 
Contains all data needed to execute itself on a GameState, when given one. */
class BuildAction {

  /* WorkerId Location -> BuildAction */
  constructor(workerId, loc) {
    this.loc = loc;
    this.workerId = workerId;
  }

  /* Return this Action's type */
  getType() { return BUILD; }

  /* Returns the location at which this Build will occur */
  getLoc() { return this.loc; }

  /* Returns the ID of the worker building this floor */
  getWorkerId() { return this.workerId; }
}

module.exports = {
  "PlaceAction" : PlaceAction,
  "MoveAction" : MoveAction,
  "BuildAction" : BuildAction,
  "execute" : execute,
  "copy" : copy,
  "PLACE" : PLACE,
  "MOVE" : MOVE,
  "BUILD" : BUILD
}
