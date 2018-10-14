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



  1. given gamestate where it's designated player's turn,
  return the turn that can be taken if any exists.

  2. given gamestate where it's other player's turn,
  return true if no turns will cause designated player to lose (in given # rounds),
  and false if any single turn will cause designated player to lose " ".


*/


/* ... -> [Maybe Turn]

*/
function chooseTurn(gameState, depth, playerID) {

}




