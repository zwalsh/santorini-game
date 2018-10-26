/* Represents an interface for an observer of a game of Santorini.
   When plugged into a Referee or other game-managing component,
   the Referee will dutifully inform it of all events of interest.

   These events include:
   (- the start of a new game (including who is playing))
   (- the start of a new series of n games)
   - each valid Turn and the resulting Board state
   - the end of a game (including the winner and reason)
   (- the end of a series (including the list of game results in the series))
   * Items in parens indicate non-mandatory, potential features

   startGame() must be called before any Turns are reported, and gameOver()
   must be called before a new game can begin. Similarly, startSeries() must
   be called before seriesOver() and seriesOver() must be called before a
   new series can begin. A series cannot be started during the progress
   of a game.

   =======  Data Definitions =======
   An EndGameReason is one of:
   - "WON"
   - "BROKEN_RULE"
   and represents whether a Player won legitimately, or because
   their opponent broke the rules.

   A GameResult is a [String, EndGameReason] where the string is
   the name of the Player who won the game.

   The data definitions for Turn and PlaceRequest are in rulechecker.js

   The data definition for a Board is in board.js
*/

class Observer {

  /* String String -> Void
    Indicates to the observer that a new game has started between the
    two Players with the given names.
  */
  startGame(playerName1, playerName2) {
  }

  /* PlaceRequest String Board -> Void
    Tells the observer that the named Player made the given placement
    of a Worker on the Board.
   */
  workerPlaced(placeReq, playerName, resultingBoard) {
  }

  /* Turn Board -> Void
    Tells the observer that a Player took the given valid Turn,
    and that it resulted in the given Board state.
   */
  turnTaken(turn, resultingBoard) {
  }
  /* GameResult -> Void
    This method is called when the game currently in progress comes
    to an end. It passes the result of that game to the Observer.
   */
  gameOver(gameResult) {
  }

  /* String String OddNumber -> Void
    Notifies this observer that a new series has started between the
    two Players with the given names, and that it will be decided by
    the majority of the given number of games.
   */
  startSeries(playerName1, playerName2, numGames) {

  }
  /* [GameResult,  ...] -> Void
    When a series reaches its conclusion, the list of GameResults
    that occurred in the series are passed into the Observer via
    this method.
   */
  seriesOver(gameResults) {

  }
}

module.exports = Observer;