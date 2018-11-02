/*
    This class represents a tournament manager that handles all aspects of
  a round-robin tournament of series of Santorini games between an arbitrary set of players.

    A round-robin tournament is one where each player plays each other player
  once, and the overall winner is the one with the most wins at the end. This
  allows for ties if multiple players win the same number of games.

    If, at any point, a player breaks a rule (or misbehaves), then all of its
  past wins are awarded to its (non-disqualified) opponents and it plays no
  further games. A match where both players are later disqualified is removed
  from the tournament record.



  ================= Data Definitions =================

  GP stands for GuardedPlayer, the data definition for which can be found in Player/guarded-player.js
  Referee data definition is in Admin/referee.js
  GameResult data definition is in Admin/referee.js

 */

class TournamentManager {

  /* [GuardedPlayer, ..., GuardedPlayer] Number -> TournamentManager
    Given a minimum length 2 list of GuardedPlayers, and a positive odd number
    of games to play between each of them, create a TournamentManager.
   */
  constructor(players, seriesLength) {
    // Canonical ordering of players in this Tournament. This list should not be mutated.
    this.players = players;
    this.seriesLength = seriesLength;

    // Players waiting to be put into a match - any two players on the waitlist
    // at any time must have already played each other, or they would be in a
    // match.
    this.waitingPlayers = [];

    // Players disqualified from the tournament for any reason
    this.badPlayers = [];

    // Players that have played all necessary matches
    this.donePlayers = [];

    // Record of interactions between all players.
    // Stores results of all series played, and used to help
    // schedule additional matches between players.
    this.matchTable = {};

    this.tournamentResolutionPromise;
  }

  /* Void -> Promise<TournamentResult>
    Start the tournament, eventually promise to give back the results of the tournament.
   */
  startTournament() {
    return new Promise(resolve => {
      this.tournamentResolutionPromise = resolve;
    });
  }

  /* GP GP -> Void
    Start a series between the given Players. Construct a Referee to manage the game,
    and set the callback to handle the series result.
  */
  startMatch(player1, player2) {

  }

  /* [GameResult, ...] -> Void
    TODO shall we try to break this function itself up besides just delegating to a bunch of helpers from within?
  */
  handleMatchResult(gameResults) {

  }

  /* Helpers for handleMatchResult:
  - addMatchToTable: put a gameresult into the table
  - function that tries to start match btwn players (using startMatch()) and puts them on waitlist if it can't
  - function that handles a cheater
  - function that checks if the tournament is now over
  - function that cleans up when a tournament is over, and maybe calls the resolve function with tourney results

   */

  /* [GameResult, ..., GameResult] -> Void
    Given a non-empty list of GameResults representing the result of a match
    between two Players, add it to the matchTable.

    If the GameResults indicate cheating, this function also updates past entries
    in the matchTable to award the past wins of the cheater to its opponents.
    If both players of any particular match have cheated, then that entry in the
    match table is updated to remove the match from the tournament record entirely.
   */
  addMatchToTable(gameResults) {

  }

  /* GP GP -> Void
    Checks if either of the two players cheated or broke in the match between the two of them.
    If so, adds the offender(s) to this tournament's list of misbehaved players.
  */
  removeBadPlayers(player1, player2) {

  }

  /* GP -> [GP, ...]
    Returns the list of all opponents that the given player still must play.
  */
  remainingOpponents(player) {

  }

  /* GP -> Void
    Attempts to put the given player into a match with someone on the waitlist.
    If they have already played everyone on the waitlist (or the waitlist is
    empty), then place them on the waitlist too.
  */
  matchOrWaitlistPlayer(player) {

  }

  /* Void -> Boolean
    Check if the tournament is over. This is the case when every player is
    either in the done list or the cheater list.
  */
  isTournamentOver() {

  }

}

module.exports = TournamentManager;