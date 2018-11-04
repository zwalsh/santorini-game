/*
  This class represents the result of a round-robin tournament between a set of Players.

  Data Definitions:

  A GuardedPlayer is defined in guarded-player.js
  A MatchTable is defined in match-table.js
*/
class TournamentResult {
  /* [GuardedPlayer, ...] [GuardedPlayer, ...] MatchTable -> TournamentResult
    Produce the result of the tournament that had the given players, bad players, and match table.
  */
  constructor(players, badPlayers, matchTable) {
    this._players = players;
    this._badPlayers = badPlayers;
    this._matchTable = matchTable;
  }

  get players() {
    return this._players;
  }

  get badPlayers() {
    return this._badPlayers;
  }

  get matchTable() {
    return this._matchTable;
  }
}

module.exports = TournamentResult;
