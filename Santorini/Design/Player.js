/*
Represents a Player in the Santorini game. It is managed by an admin component.

It will be notified of any changes to the game's state.
It is responsible for providing this Player's next Action when requested.

The Player may access a RuleChecker and is responsible for checking all of
its intended moves to be sure that they are valid.

Action and all possible variants of Actions are defined in Action.js.
GameState is defined in GameState.js.
*/

class Player {
  /* StrategyInterface -> Player
    Creates a Player with the given StrategyInterface
  */
  constructor(strategyInterface) {
    this.strategyInterface = strategyInterface;
    this.guid;
  }

  /* GameState -> PlaceAction
    Yields the next PlaceAction that the player wishes to take.
    This PlaceAction must be valid under the given GameState.
    This method will only be called when it is this Player's turn
    to place a worker.
   */
  nextPlacement(gameState) {
    return this.strategyInterface.nextPlacement(gameState);
  }

  /* GameState -> Turn
    Yields the next Turn, or set of Action(s), that the Player wishes to take.
    The Turn must be valid under the given GameState.
    This method will only be called when it is this Player's turn
    to move and possibly build in the game.
  */
  nextAction(gameState) {
    return this.strategyInterface.nextTurn(gameState);
  }

  /* Void -> GUID
    Returns a globally-unique identifier of this Player.

    Note that this is distinct from the PlayerId used within a GameState.
   */
  getGuid() {
    return this.guid;
  }
}
