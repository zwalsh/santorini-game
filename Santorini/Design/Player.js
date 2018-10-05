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
  }

  /* GameState -> Action
  Yields the next Action that the Player wishes to take. This
  Action must be valid under the given GameState. This method will only
  be called when it is this Player's turn to act.
  */
  nextAction(gameState) {
    return this.strategyInterface.nextAction(gameState);
  }
}
