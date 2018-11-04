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
    this._players = players;
    this._cheaters = cheaters;
    this._matchTable = matchTable;
  }

  get players() {
    return this._players;
  }

  get cheaters() {
    return this._cheaters;
  }

  get matchTable() {
    return this._matchTable;
  }
}

module.exports = TournamentResult;
