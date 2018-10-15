/*
  This file contains the design for a referee component in a game of Santorini.

  A Referee controls the flow of the game, maintaining the official
  version of the game state and getting Turns from each player in turn.
  Before applying a player's Turn, it validates the action(s) using the
  RuleChecker.
  After every turn, the referee checks for endgame conditions.
  If it determines that a player has won the game, it notifies both
  players of the game result.

  The Referee therefore has a GameState representing the game it is
  managing, two player objects that implement the StrategyInterface
  interface, and access to the RuleChecker.





 */