/*
  This module is a proxy for a remote Santorini referee, relaying
  messages for a game between a player and a networked opponent.

  ================== Data Definitions ==================

  GuardedPlayer is defined in Admin/guarded-player.js
  PromiseJsonSocket is defined in Lib/promise-json-socket.js

*/

class RemoteProxyReferee {

  /* GuardedPlayer PromiseJsonSocket -> RPR
    Create a RemoteProxyReferee to take the given player through
    a game occurring on the other side of the socket.
  */
  constructor (player, socket) {
    this.player = player;
    this.server = socket;
  }

  /* String -> Promise<JSON>
    Start a game between the player and an opponent with the given name.
    Resolve with the next unrecognized (non-game-level) message
    received from the server.
  */
  startGame(name) {

  }

  /* JSON -> Promise<JSON>
    Request the next action from the player according to the game-level
    message received, send it to server, and continue gameplay.
    Resolve with the next unrecognized (non-game-level) message
    received from the server.
  */
  handleGameMessage(msg) {

  }

  /*

  */
  handlePlacement() {

  }

  /*

  */
  handleTakeTurn() {

  }

}

module.exports = RemoteProxyReferee;