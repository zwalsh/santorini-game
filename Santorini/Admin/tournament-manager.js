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
  Match data definition is in

 */
const constants = require('../Common/constants');
const MatchTable = require('./match-table');
const TournamentResult = require('./tournament-result');
const Referee = require('./referee');
const DEFAULT_TIMEOUT = constants.DEFAULT_TIMEOUT;

class TournamentManager {

  /* [GuardedPlayer, ..., GuardedPlayer] Number -> TournamentManager
    Given a minimum length 2 list of (uniquely named) GuardedPlayers, and a positive odd number
    of games to play between each of them, create a TournamentManager.
   */
  constructor(players, seriesLength, observerTimeout = DEFAULT_TIMEOUT) {
    // Canonical ordering of players in this Tournament. This list should not be mutated.
    this.players = players;
    this.seriesLength = seriesLength;
    this.observerTimeout = observerTimeout;

    // Players waiting to be put into a match - any two players on the waitlist
    // at any time must have already played each other, or they would be in a
    // match.
    this.waitingPlayers = [];

    // Players disqualified from the tournament for any reason
    this.badPlayers = [];

    // Players that have played all necessary matches
    this.donePlayers = [];

    this.matchTable = new MatchTable(players.map(player => player.getId()));
    // The resolve function for the Promise created and returned in startTournament.
    // Called when the tournament is over, so that startTournament resolves to a value.
    this.resolveTournament = null;
  }

  /* Void -> Promise<TournamentResult>
    Start the tournament, eventually promise to give back the results of the tournament.
   */
  startTournament() {
    for (let player of this.players) {
      this.matchOrStorePlayer(player);
    }
    return new Promise(resolve => {
      this.resolveTournament = resolve;
      return;
    });
  }

  /* GP GP -> Promise<Match>
    Start a series between the given Players. Construct a Referee to manage the game,
    and set the callback to handle the series result.

    Returns the result of the series for testing purposes only.
  */
  startMatch(player1, player2) {
    let ref = this.createReferee(player1, player2);
    return ref.playNGames(this.seriesLength).then((gameResults) => {
      return this.handleMatchResult(player1, player2, gameResults);
    });
  }

  /* GP GP -> Referee
    Create a referee to run a match between the two players.
  */
  createReferee(player1, player2) {
    return new Referee(player1, player2, this.observerTimeout);
  }

  /* GP GP Match -> Void
     Handles the result of a match between two players. This involves the following:
     - adding the match to the match table
     - checking if a player cheated during the match
     - matching the free players as necessary
     - check if the tournament is over and if so, end it
   */
  handleMatchResult(player1, player2, match) {
    this.matchTable.setMatch(player1.getId(), player2.getId(), match);
    let badPlayersInMatch = this.disqualifyBadPlayers(player1, player2);
    this.badPlayers = this.badPlayers.concat(badPlayersInMatch);
    this.addWaitingPlayersToDoneList();
    [player1, player2].forEach((player) => {
      if (!badPlayersInMatch.includes(player)) {
        this.matchOrStorePlayer(player);
      }
    });
    if (this.isTournamentOver()) {
      this.endTournament();
    }
  }

  /* Void -> Void
    After a player or players broke in a match, add any waiting players
    to the done list if their remaining opponents were added to the broken list.
   */
  addWaitingPlayersToDoneList() {
    this.waitingPlayers.forEach((player) => {
      if (this.getPlayerRemainingOpponents(player).length === 0) {
        this.removeFromWaitlist(player);
        this.donePlayers.push(player);
      }
    });
  }

  /* GP GP -> [GP, ...]
    Checks if either of the two players cheated or broke in the match
    between the two of them. If so, returns them in a list.
  */
  disqualifyBadPlayers(player1, player2) {
    let ruleBreakerNames = this.matchTable.ruleBreakersInMatch(player1.getId(), player2.getId());
    return ruleBreakerNames.map((id) => {
      return id === player1.getId() ? player1 : player2;
    });
  }

  /* GP -> Void
    Attempts to put the given player into a match with someone on the waitlist,
    unless they have played all games, in which case put them on the done list.

    If they have already played everyone on the waitlist (or the waitlist is
    empty), then place them on the waitlist too.
  */
  matchOrStorePlayer(player) {
    let remainingOpponents = this.getPlayerRemainingOpponents(player);
    if (remainingOpponents.length === 0) {
      this.donePlayers.push(player);
      return;
    }
    let maybeOpponent = this.waitingPlayers.find(player => {
      return remainingOpponents.includes(player);
    });
    if (maybeOpponent) {
      this.removeFromWaitlist(maybeOpponent);
      this.startMatch(player, maybeOpponent);
    } else {
      this.waitingPlayers.push(player);
    }
  }

  /* GP -> [GP, ...]
    Return a list of all non-disqualified players that the given
    player still needs to play against.
  */
  getPlayerRemainingOpponents(player) {
    let remainingOpponentNames = this.matchTable.getRemainingOpponents(player.getId());
    return this.players.filter((p) => {
      return remainingOpponentNames.includes(p.getId()) &&
        !this.badPlayers.includes(p);
    });
  }

  /* GP -> Void
    Remove the given player from the waiting list.
  */
  removeFromWaitlist(player) {
    let newWaitingPlayers = this.waitingPlayers.filter(waitingPlayer => {
      return player !== waitingPlayer;
    });
    this.waitingPlayers = newWaitingPlayers;
  }

  /* Void -> Boolean
    Check if the tournament is over. This is the case when every player is
    either in the done list or the cheater list.
  */
  isTournamentOver() {
    return this.players.length === (this.donePlayers.length + this.badPlayers.length);
  }

  /* Void -> Void
    Calls the stored resolution function from the start of the tournament
    with the tournament's current results.
  */
  endTournament() {
    let tournamentResult = new TournamentResult(this.players, this.badPlayers, this.matchTable);
    this.resolveTournament(tournamentResult);
  }
}

module.exports = TournamentManager;