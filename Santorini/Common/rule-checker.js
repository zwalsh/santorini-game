/*
Rule checker

Has a board for getting board state data
Tracks additional game state data, related to:
  - whose turn it is
  - what move has just been made
  - which workers are which player's -> It needs to be told this ;(

Can tell others:
- whose turn it is (which player)
- given a PlayerId and an Action, is that action valid?


An Action is defined in action.js

WorkerId is int in range [0,3]
PlayerId is int in range [0.1]
*/

class RuleChecker {

  constructor(board, p1Id, p2Id) {
    this.board = board;
    this.p1 = p1Id;
    this.p2 = p2Id;

    /*TODO what is this*/
    this.lastAction;
    /*TODO what is this*/
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
  is aware of. */
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

}
