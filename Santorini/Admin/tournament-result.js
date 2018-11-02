/*
  This class represents the result of a round-robin tournament between a set of Players.

  Data Definitions:

  A GuardedPlayer is defined in guarded-player.js
  A MatchTable is defined in match-table.js
*/
class TournamentResult {
  /* [GuardedPlayer, ...] [GuardedPlayer, ...] MatchTable -> TournamentResult
    Produce the result of the tournament that had the given players, cheaters, and match table.
  */
  constructor(players, cheaters, matchTable) {
    this.players = players;
    this.cheaters = cheaters;
    this.matchTable = matchTable;
  }
}

module.exports = TournamentResult;
