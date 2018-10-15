/*
  This module implements a strategy that chooses a Turn for a player in a game
  of Santorini. This strategy is intended to be used after all workers have
  been placed in the game.

  The data definition for a Turn is in Action.js

  The data definition for a PlayerId is in GameState.js

  Given a game state, a look-ahead depth, a player ID to play for,
  and the player whose turn it is, it will determine a move that the
  player can take in order to stay alive in the game for the given number
  of rounds.
  A StayAliveStrategy is not constructed for a particular player.


  needs:
  - turn generator



  Two sub-functions:

 n

  1. given gamestate where it's designated player's turn,
  return the turn that can be taken if any exists.

  2. given gamestate where it's other player's turn,
  return true if no turns will cause designated player to lose (in given # rounds),
  and false if any single turn will cause designated player to lose " ".


*/
const TurnGenerator = require('../Common/TurnGenerator.js').TurnGenerator;
const MoveGenerator = require('../Common/TurnGenerator.js').MoveGenerator;
const Action = require('../Common/Action.js');
const RuleChecker = require('../Common/RuleChecker.js');


/* GameState Natural -> [Maybe Turn]
Choose a turn for the player whose turn it is (in GameState)
that is guaranteed to keep them alive for the given number of rounds.
*/
function chooseTurn(gameState, depth) {
  let tg = new TurnGenerator(gameState);
  // if lookahead depth is 0, this is the last round to check,
  // so return any move that the player could take
  if (depth === 0) {
    return tg.hasNext() ? tg.next() : false;
  }
  while(tg.hasNext()) {
    let turn = tg.next();
    // Check if turn is a winning move.
    if (turn.length === 1) { return turn; }
    // If not, check that it does not let opponent win.
    let gsCopy = gameState.copy();
    for (let action of turn) { Action.execute(action, gsCopy); }
    if (!canWin(gsCopy, depth - 1)) {
      return turn;
    }
  }
  return false;
}

/* GameState Natural -> Boolean

Player is guaranteed to have a winning option in some
move they could choose from this round

Player can win if they can reach height 3 in this round,
or if their move results in a state where their opponent
cannot survive in the given number of rounds
(aka cannot make any moves that will keep them alive for n rounds).
*/
function canWin(gameState, depth) {

  // Check all 8 possible MoveActions for win condition (can move to 3-height)
  let mg = new MoveGenerator(gameState);
  while (mg.hasNext()) {
    let moveLoc = mg.next().getLoc();
    if (gameState.getBoard().getHeight(moveLoc[0], moveLoc[1]) === RuleChecker.WINNING_HEIGHT) {
      return true;
    }
  }
  // If depth is 0, we can't win if we can't move to a 3-height
  if (depth === 0) {
    return false;
  }
  // Otherwise, also check all possible Turns for opponent loss condition
  let tg = new TurnGenerator(gameState);
  while (tg.hasNext()) {
    let turn = tg.next();

    let gsCopy = gameState.copy();
    for (let action of turn) { Action.execute(action, gsCopy); }
    if (chooseTurn(gsCopy, depth - 1) === false) {
      return true;
    }
  }
  return false;
}

module.exports = {
  "chooseTurn": chooseTurn,
  "canWin": canWin
};
