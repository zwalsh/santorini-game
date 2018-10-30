/*
  This class represents the result of a round-robin tournament between a set of Players.

  It provides a sorted list of PlayerResults (sorted by wins, descending)
  and a list of UUIDs of Players that cheated (and therefore are not included in the
  sorted list of standings).

  Data Definitions:

  A PlayerResult is an object with two fields:
  - playerId: the UUID of the Player
  - wins: the number of games the Player won in the tournament
*/
class TournamentResult {
  /* [PlayerResult, ...] [UUID, ...] -> TournamentResult
    Creates a TournamentResult (sorting the list of PlayerResults).
  */
  constructor(playerResults, disqualifiedPlayerIds) {
    // todo - must sort PlayerResult and assign fields
  }

  /* Void -> [PlayerResult, ...]
    Returns the list of PlayerResults for non-disqualified Players,
    sorted by wins (descending).
  */
  getPlayerResults() {}

  /* Void -> [UUID, ...]
    Returns the list of ids of Players who were disqualified during the tournament.
  */
  getDisqualifiedPlayerIds() {}

  // todo - may be nice to include a getWinner() method
}