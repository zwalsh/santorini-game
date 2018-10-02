/*
Represents a Player in the Santorini game. It is managed by an admin component.

It will be notified of any changes to the game's state so that it may track
the state internally. It is also responsible for providing this Player's next
Action when requested.

The Player has access to a RuleChecker and is responsible for checking all of
its intended moves to be sure that they are valid.

Action and all possible variants of Actions are defined in action.js.
*/

const Board = require('./board.js');

class Player {
  /* PlayerId RuleChecker -> Player
  Creates a Player with the given Id and a RuleChecker for the game that the
  Player is playing.
  */
  constructor(id, ruleChecker) {
    this.id = id;
    this.ruleChecker = ruleChecker;

    /* This copy of a Board will be used to track game state. This is necessary
    because the Player has no access to the authoritative game Board.
    */
    this.board = new Board();
  }

  /* Void -> Action
  Yields the next Action that the Player wishes to take. This Action must
  be valid given the current state of the game and must be tagged with the
  Player's PlayerId.
  */
  nextAction() {}

  /* Action -> Void
  Called when any Action is applied to the central Board. This allows this
  Player to keep its version of the Board in sync with the actual game state.
  */
  actionTaken(action) {}
}
