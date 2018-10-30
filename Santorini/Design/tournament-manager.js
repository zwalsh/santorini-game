/*
    This class is a design for a TournamentManager that handles all aspects of
  a round-robin tournament of Santorini games (or series of games) between an
  arbitrary number of players.

    A round-robin tournament is one where each player plays each other player
  once, and the overall winner is the one with the most wins at the end. This
  allows for ties if multiple players win the same number of games.

    If, at any point, a player breaks a rule (or misbehaves), then all of its
  past wins are awarded to its (non-disqualified) opponents and it plays no
  further games. A match where both players are later disqualified does not
  count as a win for either player.

  ========= Data Definitions =========
  A TournamentResult is defined in tournament-result.js

*/
class TournamentManager {
  /* [GuardedPlayer, ...] Number -> TournamentManager
    Creates a TournamentManager that manages a tournament between the given
    list of players, where each interaction between players is a series of the
    specified length (which must be a positive, odd number).
  */
  constructor(players, seriesLength) {

  }

  /* Void -> Promise<TournamentResult>
    Runs the tournament, reporting the result (as a Promise) when done.

    Note for implementors - this will include:
    - setting up matches between players
    - recording the results of every match
    - ensuring every player plays each other
    - minimizing wait time between matches
    - handling when a player is disqualified
  */
  runTournament() {

  }
}