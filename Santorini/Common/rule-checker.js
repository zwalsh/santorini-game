/*
This class represents a rule checker for a game of Santorini.

It allows players and admins to check if an action by a player is valid given
the state of the Board and the game. It can also determine whose turn it is.

It keeps track of additional game state information like the last action taken
and which player controls which worker. It has a Board for accessing board state
data.


Data definitions:

Action is defined in action.js

WorkerId is an int in the range [0,3]
PlayerId is an int in the range [0.1]
*/

class RuleChecker {
  /* Board PlayerId PlayerId -> RuleChecker
  Creates a RuleChecker for the game with the given Board and Players, where the
  first player given is assumed to move first.
  */
  constructor(board, p1Id, p2Id) {
    this.board = board;
    this.p1 = p1Id;
    this.p2 = p2Id;

    /* The most recent Action taken in the game */
    this.lastAction;
    /* Map of WorkerIds to the PlayerIds that own them */
    this.workerToPlayer = new Map();

  }

  /* Action -> Boolean
  Is the given Action valid to take in the current game state?
  */
  validate(action) {}

  /* Void -> PlayerId
  Return the PlayerId corresponding to the player who must
  take the next action in the game.
  This can be determined from the prior Action that this rule checker
  is aware of.
  */
  whoseTurn() {}

  /* Action -> Void
  Update this rule checker with the last action that was taken in the game,
  and the result of that action, if there was one.
  This allows the rule checker to accurately determine what action
  can be taken next in the game, by which player.
  If the action added a worker to the board, then update this rule checker's
  map of playerIDs - workerIDs
  */
  notifyOfAction(action, result) {}

  /* Void -> Boolean
  Returns true if the game is in an end state.
  */
  isGameOver() {}
}

module.exports = RuleChecker;
