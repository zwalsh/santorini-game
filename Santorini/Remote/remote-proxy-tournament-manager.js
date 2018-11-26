/*
  This module is a proxy for a remote Santorini tournament manager.
  It handles communication between a player and the server at the
  tournament level, translating network messages and player data
  to send in either direction.
  It delegates to a referee proxy for game-level interaction.

  ================== Data Definitions ==================

  GuardedPlayer is defined in Admin/guarded-player.js
  PromiseJsonSocket is defined in Lib/promise-json-socket.js
  RemoteProxyReferee is defined in remote-proxy-referee.js

  EncounterOutcome is defined in client-message-converter.js
*/

class RemoteProxyTournamentManager {

  /* GuardedPlayer PromiseJsonSocket -> RPTM
    Create a RemoteProxyTournamentManager to take the given player
    through a tournament occurring on the other side of the socket.
  */
  constructor(player, socket) {
    this.player = player;
    this.server = socket;
  }

  /* Void -> Promise<Void>
    Register the player in the tournament, play all games of the
    tournament, report the result to the player, and resolve.
  */
  start() {
    return this.register()
      .then((message) => {
        return this.handleTournamentMessage(message);
      })
      .then((encounterOutcomes) => {
        return this.notifyPlayerOfEnd(encounterOutcomes);
      });
  }

  /* Void -> Promise<JSON>
    Register the player for the tournament by sending its
    name to the server. If the server requests a rename,
    then rename the player. Resolve with the next message received.
  */
  register() {

  }

  /* JSON -> Promise<[EncounterOutcome, ...]>
    Handle a tournament-level message received either after registration
    or by a referee when a game concludes. The message will either be
    the name of a new opponent, or a list of tournament results when the
    tournament is over.
  */
  handleTournamentMessage(result) {

  }

  /* String -> Promise<JSON>
    Play the next game of the tournament against the opponent
    with the given name, returning the resulting message
    when the game is over.
  */
  playNextGame(name) {

  }

  /* String -> RemoteProxyReferee
    Create a referee to run a game between the player and an opponent
    with the given name.
  */
  createReferee(name) {

  }

  /* [EncounterOutcome, ...] -> Promise<Void>
    Notify the player that the tournament has ended with the given results.
   */
  notifyPlayerOfEnd(encounterOutcomes) {

  }
}

module.exports = RemoteProxyTournamentManager;