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
    Given a non-empty list of GuardedPlayers, and a positive odd number
    of games to play between each of them, create a TournamentManager.
   */
  constructor(players, seriesLength) {
    this.players = players;
    this.seriesLength = seriesLength;

    // Players waiting to be put into a match
    this.waitingPlayers = []

    // Players disqualified from the tournament for any reason
    this.badPlayers = [];

    // Record of interactions between all players.
    // Stores results of all series played, and used to help
    // schedule additional matches between players.
    this.matchTable = {};
  }

  /* Void -> Promise<TournamentResult???> TODO return type ??
    Start the tournament, eventually promise to give back the results of the tournament??
    TODO figure out how to deal with the promise thing

   */
  startTournament() {

  }

  /* GP GP -> Void
    Start a series between the given Players. Construct a Referee to manage the game,
    and set the callback to handle the series result.
  */
  startMatch() {

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




}

module.exports = TournamentManager;