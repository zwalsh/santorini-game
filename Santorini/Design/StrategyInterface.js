/**
 * Implemented by anything that wishes to participate in a game of Santorini.
 * This may be a remote TCP connection, a (local) AI component, a UI, etc.
 *
 * Must implement a method to provide its next Action given a current GameState.
 * When it is asked for an Action, the StrategyInterface knows that it must
 * be its turn. As such, it knows which player it is (by inspecting the
 * GameState), and knows which Workers it can move.
 *
 * See the definitions of Action and GameState in Action.js and GameState.js
 * respectively.
 */

class StrategyInterface {
    constructor() {}

    /* GameState -> Action
    Yields the next Action that the StrategyInterface wishes to take. This
    Action must be valid under the given GameState. This method will only
    be called when it is this StrategyInterface's turn to act.
    */
    nextAction(gameState) {}
  }
