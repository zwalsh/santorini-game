/*
  A MatchTable is a data structure that records all interactions between players in a
  tournament of Santorini. It provides the following functionality:
  - getting and setting a particular match between players
  - getting the remaining opponents of a player
  - getting all matches a player has been a part of
  - getting all matches in the tournament

  ================ Data Definitions ================
  GameResult is defined in referee.js

  A Match is one of:
  - [GameResult, ..., GameResult] - a non-empty list of GameResults indicating a match
                                    between two players that has completed, where no
                                    more than one player cheated.
  - []                            - an empty list, indicating a Match struck from the
                                    record, as both players cheated.
*/

class MatchTable {

  /* [String, ...] -> MatchTable
     Takes a list of at least length two of player names, where each player name
     in the list is unique, and makes a MatchTable.
  */
  constructor(players) {

  }

  /* String String -> Maybe<Match>
    Returns the Match between the two players, or false if it has not occurred.
  */
  getMatch(p1Name, p2Name) {

  }

  /* String String Match -> Void
    Sets the Match that has occurred between the two players.

    If cheating occurred during the Match, then this method updates all past
    Matches involving the cheater and awards those games to the opponent.

    If both players in a Match are determined to be cheaters, then that match
    is set to be the empty array.
  */
  setMatch(p1Name, p2Name, match) {
    // remember both Match cases
  }

  /* String -> [String, ...]
    Returns the names of all opponents against whom the given player has not
    yet played.
  */
  getRemainingOpponents(pName) {

  }

  /* Void -> [GameResult, ...]
    Returns a list of all GameResults that have occurred in the tournament.
    Sorted in order of the players as given to this MatchTable in the
    constructor.
  */
  getAllGames() {

  }
}