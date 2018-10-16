/*
   Represents a Strategy that can participate in a game of Santorini.
   Uses a Strategy for placing a worker and a Strategy for choosing
   a Turn. These are provided at construction.

   See the definitions of Action and GameState in Action.js and GameState.js
   respectively.
 */

class CompoundStrategy {
  /* [GameState -> PlaceAction] [GameState -> Turn] -> CompoundStrategy
    Given two Strategies (one for placing a Worker and one for producing a Turn),
    combines them into a Strategy that a Player can use without thinking about
    what the phase of the game is.
   */
  constructor(choosePlacement, chooseTurn) {
    this.choosePlacement = choosePlacement;
    this.chooseTurn = chooseTurn;
  }

  /* GameState -> PlaceAction
    Yields the next PlaceAction that the player wishes to take.
    This PlaceAction must be valid under the given GameState.
    This method will only be called when it is this Player's turn
    to place a worker.
  */
  nextPlacement(gameState) {
    return this.choosePlacement(gameState);
  }

  /* GameState -> Turn
    Yields the next Turn, or set of Action(s), that the StrategyInterface wishes to take.
    The Turn must be valid under the given GameState.
    This method will only be called when it is this StrategyInterface's turn
    to move and possibly build in the game.
  */
  nextTurn(gameState) {
    return this.chooseTurn(gameState);
  }
}

module.exports = CompoundStrategy;