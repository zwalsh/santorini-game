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

   A GameResult is a [UUID, EndGameReason] where the UUID is
   the identifier of the Player who won the game.

   The data definitions for Turn and PlaceRequest are in rulechecker.js

   The data definition for a Board is in board.js

   A Match is one of:
    - [GameResult, ..., GameResult] - a non-empty list of GameResults indicating a match
                                      between two players that has completed, where no
                                      more than one player cheated.
    - []                            - an empty list, indicating a Match struck from the
                                    record, as both players cheated.
*/

class Observer {

  /* String String -> Promise<Void>
    Indicates to the observer that a new game has started between the
    two Players with the given names.
  */
  startGame(playerName1, playerName2) {
  }

  /* PlaceRequest String Board -> Promise<Void>
    Tells the observer that the named Player made the given placement
    of a Worker on the Board.
   */
  workerPlaced(placeReq, playerName, resultingBoard) {
  }

  /* Turn Board -> Promise<Void>
    Tells the observer that a Player took the given valid Turn,
    and that it resulted in the given Board state.
   */
  turnTaken(turn, resultingBoard) {
  }

  /* GameResult -> Promise<Void>
    This method is called when the game currently in progress comes
    to an end. It passes the result of that game to the Observer.
   */
  gameOver(gameResult) {
  }

  /* String String OddNumber -> Promise<Void>
    Notifies this observer that a new series has started between the
    two Players with the given names, and that it will be decided by
    the majority of the given number of games.
   */
  startSeries(playerName1, playerName2, numGames) {

  }

  /* Match -> Promise<Void>
    When a series reaches its conclusion, the match result
    is passed into the Observer via this method.
   */
  seriesOver(match) {

  }
}

module.exports = Observer;