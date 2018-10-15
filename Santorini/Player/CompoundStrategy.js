/**
 * Represents a Strategy that can participate in a game of Santorini.
 * Uses a Strategy for placing a worker and a Strategy for choosing
 * a turn. These are specified at construction.
 *
 * See the definitions of Action and GameState in Action.js and GameState.js
 * respectively.
 */

const MAX_WORKERS_PER_PLAYER = require('../Common/RuleChecker.js').MAX_WORKERS_PER_PLAYER;

class CompoundStrategy {
  /* [GameState -> PlaceAction] [GameState -> Turn] -> CompoundStrategy
    Given two Strategies (one for placing a Worker and one for producing a Turn),
    combines them into a Strategy that a Player can use without thinking about
    what the phase of the game is.
   */
  constructor(choosePlacement, chooseTurn) {
    this.choosePlacement = choosePlacement;
    this.chooseTurn = chooseTurn;
    this.currentActionList = [];
  }

  /* GameState -> Action
  Yields the next Action that the StrategyInterface wishes to take. This
  Action must be valid under the given GameState. This method will only
  be called when it is this StrategyInterface's turn to act.
  */
  nextAction(gameState) {
    let myPlayerId = gameState.whoseTurn;
    let myWorkers = gameState.getWorkerList(myPlayerId);
    if (myWorkers.length < MAX_WORKERS_PER_PLAYER) {
      return this.choosePlacement(gameState);
    }
    if (this.currentActionList.length === 0) {
      this.currentActionList = this.chooseTurn(gameState);
    }
    return this.currentActionList.splice(0, 1)[0];
  }
}

module.exports = CompoundStrategy;