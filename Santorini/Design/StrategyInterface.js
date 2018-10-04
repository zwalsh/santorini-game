/**
 * Implemented by anything that wishes to participate in a game of Santorini.
 * This may be a remote TCP connection, a (local) AI component, a UI, etc.
 * 
 * Must implement methods to:
 * - provide its next move
 * - receive updates about game state
 * 
 * 
 * 
 * 
 * 
 * 
 */



class StrategyInterface {
    /* PlayerId -> StrategyInterface
    Creates a StrategyInterface with the given id (0 or 1)
    */
    constructor(id) {
      this.playerId = id;
    }
  
    /* Void -> Action
    Yields the next Action that the StrategyInterface wishes to take. This Action must
    be valid given the current state of the game and must be tagged with the
    StrategyInterface's PlayerId.
    */
    nextAction() {}
  
    /* GameState -> Void
    Called when any updates are made to the central GameState. This allows this
    StrategyInterface to keep its knowledge of the game in sync with the actual game state.
    */
  }