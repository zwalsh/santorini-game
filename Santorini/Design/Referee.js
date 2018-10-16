/*
  This file contains the design for a referee component in a game of Santorini.

  A Referee controls the flow of the game, maintaining the official
  version of the game state and getting Turns from each player in turn.
  Before applying a player's Turn, it validates the action(s) using the
  RuleChecker.
  After every Turn, the referee checks for endgame conditions.
  If it determines that a player has won the game, it notifies both
  players of the game result.

  The Referee therefore has a GameState representing the game it is
  managing, two player objects that implement the StrategyInterface
  interface, and access to the RuleChecker.

  VERY IMPORTANT: Data Integrity Protection Duty!
  The Referee gets information (Turns and PlaceActions) from an untrusted player.
  Internal components, such as GameState and RuleChecker, expect their users
  to provide correctly formed data.
  Therefore, it is the Referee's duty to ensure that the data from players
  is well-formed before using it with internal components.

  Examples of this may be:
   - Turns with too many / wrong elements
   - Incomplete Actions (ex. missing location)


  ============= DATA DEFINITIONS =============

  An EndGameReason is one of:
    - WON
    - BROKEN_RULE
 */

const GameState = require('./../Common/GameState.js');
const RuleChecker = require('./../Common/RuleChecker.js');

// EndGameReason Constants
const WON = "WON";
const BROKEN_RULE = "BROKEN_RULE";

class Referee {
  /* Player Player -> Referee
     Creates a Referee that will coordinate a game between the two Players,
     where the first Player given goes first.

     The Referee will create a GameState that it will keep valid throughout
     the course of the game.
   */
  constructor(player1, player2) {
    this.players = [player1, player2];
    this.gameState = new GameState();
  }

  /* Void -> [GUID, EndGameReason]
    Plays the game to completion.

    This has two parts.

    First, it takes players through game setup, as described in setupGame().
    If that results in an end game (through player error), end the game.

    Second, it repeats the following steps:
      1. Get whose turn it is from the GameState
      2. Get the Turn from the Player whose turn it is
      3. Validate that Turn
        a. Ending the game if the Turn is invalid
      4. Apply the Turn to the GameState
      5. Check if the Player has won because:
        a. They moved to the winning height
        b. Their opponent cannot move

    Returns the GUID of the Player who won, and the reason why they won.
   */
  playGame() { /* TODO */ }

  /* Void -> [Maybe [GUID, EndGameReason]]
    Leads players through placing their workers in the game.
    Repeats the following steps until all workers are placed in the game:
      1. Get whose turn it is from the GameState
      2. Get the PlaceAction from the player whose turn it is
      3. Validate that PlaceAction
        a. Ending the game if that PlaceAction is invalid
      4. Apply the PlaceAction to the GameState
   */
  setupGame() { /* TODO */ }


}
