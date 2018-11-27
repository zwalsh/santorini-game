/*
  This module is a client component that interfaces with a remote
  Santorini tournament server.

  Takes in a socket connection to a running tournament server,
  and a player to connect to that tournament.
  It gives the player and the network connection to a component
  that takes the player through an entire tournament, and it closes
  the socket connection when the tournament is over.

  ================== Data Definitions ==================

  RemoteProxyTournamentManager is defined in Remote/remote-proxy-tournament-manager.js
  GuardedPlayer is defined in Admin/guarded-player.js
  PromiseJsonSocket is defined in Lib/promise-json-socket.js

*/

const PromiseJsonSocket = require('../Lib/promise-json-socket');
const RemoteProxyTournamentManager = require('../Remote/remote-proxy-tournament-manager');

class SantoriniClient {

  /* GuardedPlayer Socket -> SantoriniClient
    Construct a client that connects the player to a
    tournament using the given socket.
   */
  constructor(player, socket) {
    this.socket = socket;
    this.player = player;
  }

  /* Void -> Promise<Void>
    Place the player into a tournament.
    Close the socket when the tournament ends.
    Shut down gracefully if the server violates the protocol
    or if the player breaks.
  */
  start() {
    return this.createTournament()
      .start()
      .then(() => { return this.shutdown() })
      .catch((err) => {
        // if (err && err.stack) {
        //   console.log(err.stack);
        // }
        return this.shutdown();
      });
  }

  /* Void -> RemoteProxyTournamentManager
    Wrap the socket in a PromiseJsonSocket and create a new
    RPTM with that socket and the player.

    This function is separated out for testing purposes.
  */
  createTournament() {
    let pjSocket = new PromiseJsonSocket(this.socket);
    return new RemoteProxyTournamentManager(this.player, pjSocket);
  }

  /* Void -> Void
    Close the socket.
  */
  shutdown() {
    this.socket.end();
  }
}

module.exports = SantoriniClient;