/*
  This module is a proxy for a remote Santorini referee, relaying
  messages for a game between a player and a networked opponent.

  ================== Data Definitions ==================

  GuardedPlayer is defined in Admin/guarded-player.js
  PromiseJsonSocket is defined in Lib/promise-json-socket.js

  Server messages:

  Placement
  WorkerPlace
  JsonWorker
  Coordinate
  Board

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
    Delegate to the appropriate message-handling method, if a game-level
    message is received.
    Resolve with the next unrecognized (non-game-level) message
    received from the server.
  */
  handleGameMessage(msg) {

  }

  /* Placement -> Promise<JSON>
    Convert the Placement to a placeInitialWorker() method call
    on the player. Send the player's response back to the server.

    Resolve with the next message received from the server.
  */
  handlePlacement() {

  }

  /* Board -> Promise<JSON>
    Convert the Placement to a takeTurn() method call
    on the player. Send the player's response back to the server.

    Resolve with the next message received from the server.
  */
  handleTakeTurn() {

  }

}

module.exports = RemoteProxyReferee;