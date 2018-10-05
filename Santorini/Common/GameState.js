
/*
It knows:
- Board
- whose turn
- last action
- whose workers are whose

Allows mutation of all its fields.

- can tell if the game is over



*/
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
  Returns this GameState's Board.
  */
  getBoard() {

  }

  /* Void -> Void
  Update the GameState so that it is the other Player's turn.
  */
  flipTurn() {

  }

  /* Void -> PlayerId
  Return the PlayerId of the Player who must take the next Action.
  */
  getWhoseTurn() {

  }

  /* Void -> Action
  Return the last Action taken in the game. May be null.
  */
  getLastAction() {

  }

  /* WorkerId -> PlayerId
  Given a WorkerId, return the id of the Player who owns that Worker.
  */
  getOwner(workerId) {

  }

  /* Action -> Void
  Update the last Action taken in the game.
  */
  setLastAction(action) {

  }

  /* WorkerId PlayerId -> Void
  Associate the given WorkerId with the given PlayerId.
  */
  addOwnership(workerId, ownerId) {
    
  }
}
