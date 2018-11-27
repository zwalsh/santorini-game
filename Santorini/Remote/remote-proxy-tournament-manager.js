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

const ClientMessageConverter = require('./client-message-converter');
const ClientMessageFormChecker = require('./client-message-form-checker');
const RemoteProxyReferee = require('./remote-proxy-referee');

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
    this.server.sendJson(this.player.getId());
    let renameOrNextMessage = this.server.readJson();

    return renameOrNextMessage.then((msg) => {
      if (ClientMessageFormChecker.checkPlayingAs(msg)) {
        let newName = ClientMessageConverter.jsonToName(msg);
        return this.player.setId(newName).then(() => { return this.server.readJson() });
      } else {
        return msg;
      }
    });
  }

  /* JSON -> Promise<[EncounterOutcome, ...]>
    Handle a tournament-level message received either after registration
    or by a referee when a game concludes. The message will either be
    the name of a new opponent, or a list of tournament results when the
    tournament is over.
  */
  handleTournamentMessage(message) {
    if (ClientMessageFormChecker.checkName(message)) {
      return this.playNextGame(message).then((nextMessage) => {
        return this.handleTournamentMessage(nextMessage);
      });
    } else if (ClientMessageFormChecker.checkResults(message)) {
      return Promise.resolve(message);
    } else {
      return Promise.reject(new Error(this.player.getId() + ' unexpected value ' + JSON.stringify(message)));
    }
  }

  /* String -> Promise<JSON>
    Play the next game of the tournament against the opponent
    with the given name, returning the resulting message
    when the game is over.
  */
  playNextGame(name) {
    let ref = this.createReferee();
    return ref.startGame(name);
  }

  /* Void -> RemoteProxyReferee
    Create a referee to run a game between the player and an opponent.
  */
  createReferee() {
    return new RemoteProxyReferee(this.player, this.server);
  }

  /* [EncounterOutcome, ...] -> Promise<Void>
    Notify the player that the tournament has ended with the given results.
   */
  notifyPlayerOfEnd(encounterOutcomes) {
    let gameResults = ClientMessageConverter.jsonToGameResults(encounterOutcomes);
    return this.player.notifyTournamentOver(gameResults);
  }
}

module.exports = RemoteProxyTournamentManager;