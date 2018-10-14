/*
  This file represents the state of a Santorini game.
  It has a Board for tracking and accessing height and worker location data.
  On top of that, it tracks worker ownership data, which player's
  turn it is, and what was the last Action taken in the game.

  It allows users to view and update the current state of the game.

  GameState is a data object and performs no checks on the validity of
  the data it is given, nor the order/context of operations called on it
  to mutate its state.

  Callers are responsible for properly maintaining the GameState's state
  by calling the correct groups of associated methods when making updates
  to its Board, last Action, worker ownership, and turn information.
    Example usage protocol:
      1. Change this GameState's Board with some action
      2. Update this GameState's last Action to be that^ action
        2a. If a worker was added, update this GameState's worker ownership map
      3. Possibly call flipTurn() to change which player's turn it is


  ---- Data Definitions -----

  A PlayerId is an integer in the range [0,1].

  The data definition for Action is in Action.js

  The data definition for Board is in Board.js

*/
const Action = require('./Action.js');
const PlaceAction = Action.PlaceAction;
const MoveAction = Action.MoveAction;
const BuildAction = Action.BuildAction;

/* The integers used to identify the 2 players in the game
for turn and worker ownership information */
const PLAYER1ID = 0;
const PLAYER2ID = 1;

class GameState {
  /* Board PlayerId Action Map<WorkerId, PlayerId> -> GameState
  Creates a GameState with the given information.
    - board is the only required argument.
    - whoseTurn is 0 or 1, and represents whose turn it is. Default is 0.
    - lastAction is the last action taken in the course of the game. Default is null.
    - workerOwnership stores which Player controls each Worker. Default is an empty Map.
  */
  constructor(board, whoseTurn, lastAction, workerOwnership) {
    this.board = board;
    this.whoseTurn = arguments.length > 1 ? whoseTurn : 0;
    this.lastAction = arguments.length > 2 ? lastAction : null;
    this.workerOwnership = arguments.length > 3 ? workerOwnership : new Map();
  }

  /* Void -> Board
  Returns this GameState's Board. This is a mutable reference.
  */
  getBoard() {
    return this.board;
  }

  /* Void -> Void
  Update the GameState so that it is the other Player's turn.
  */
  flipTurn() {
    if (this.whoseTurn == PLAYER1ID) {
      this.whoseTurn = PLAYER2ID;
    } else {
      this.whoseTurn = PLAYER1ID;
    }
  }

  /* Void -> PlayerId
  Return the PlayerId of the Player who must take the next Action.
  */
  getWhoseTurn() {
    return this.whoseTurn;
  }

  /* Void -> Action
  Return the last Action taken in the game. May be null.
  */
  getLastAction() {
    return this.lastAction;
  }

  /* WorkerId -> PlayerId
  Given a WorkerId, return the id of the Player who owns that Worker.
  */
  getOwner(workerId) {
    return this.workerOwnership.get(workerId);
  }

  /* PlayerId -> [Listof WorkerId]
  Returns the list of Ids of Worker owned by the Player with the given PlayerId.
  */
  getWorkerList(playerId) {
    let workers = Array.from(this.workerOwnership.entries());
    return workers.filter((entry) => {
      // keep only the Workers owned by the given PlayerId
      return entry[1] === playerId;
    }).map((entry) => {
      // return only the WorkerId from the pair
      return entry[0];
    });
  }

  /* Action -> Void
  Update the last Action taken in the game. Makes a copy of the
  given Action before storing it, to ensure that this GameState's last
  action can't be mutated from outside the class.
  */
  setLastAction(action) {
    this.lastAction = Action.copy(action);
  }

  /* WorkerId PlayerId -> Void
  Associate the given WorkerId with the given PlayerId.
  */
  addOwnership(workerId, ownerId) {
    this.workerOwnership.set(workerId, ownerId);
  }

  /* Void -> GameState
  Returns a deep copy of this GameState.
  */
  copy() {
    let actionCopy = this.lastAction === null ? null : Action.copy(this.lastAction);
    return new GameState(this.board.copy(), this.whoseTurn,
      actionCopy, new Map(this.workerOwnership));
  }
}

module.exports = GameState;
