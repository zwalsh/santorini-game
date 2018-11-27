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

const ClientMessageConverter = require('./client-message-converter');
const ClientMessageFormChecker = require('./client-message-form-checker');

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
    let nextMessageFromServer = this.player.newGame(name).then(this.server.readJson);

    let gameMessage = nextMessageFromServer.then((msg) => {
      if (ClientMessageFormChecker.checkName(msg)) {
        return this.player.setId(msg).then(this.server.readJson);
      } else {
        return msg;
      }
    });

    return gameMessage.then((val) => {
      return this.handleGameMessage(val);
    });
  }

  /* JSON -> Promise<JSON>
    Delegate to the appropriate message-handling method, if a game-level
    message is received.
    Resolve with the next unrecognized (non-game-level) message
    received from the server.
  */
  handleGameMessage(msg) {
    if (ClientMessageFormChecker.checkBoard(msg)) {
      return this.handleTakeTurn(msg).then((nextMessage) => {
        return this.handleGameMessage(nextMessage);
      });
    } else if (ClientMessageFormChecker.checkPlacement(msg)) {
      return this.handlePlacement(msg).then((nextMessage) => {
        return this.handleGameMessage(nextMessage);
      });
    } else {
      return Promise.resolve(msg);
    }
  }

  /* Placement -> Promise<JSON>
    Convert the Placement to a placeInitialWorker() method call
    on the player. Send the player's response back to the server.

    Resolve with the next message received from the server.
  */
  handlePlacement(placement) {
    let initWorkerList = ClientMessageConverter.jsonToInitWorkerList(placement);

    let workerPlacement = this.player.placeInitialWorker(initWorkerList)
      .then(ClientMessageConverter.placeRequestToJson);

    return workerPlacement.then((placement) => {
      this.server.sendJson(placement);
      return this.server.readJson();
    });
  }

  /* Board -> Promise<JSON>
    Convert the Placement to a takeTurn() method call
    on the player. Send the player's response back to the server.

    Resolve with the next message received from the server.
  */
  handleTakeTurn(jsonBoard) {
    let board = ClientMessageConverter.jsonToBoard(jsonBoard);

    let turn = this.player.takeTurn(board)
      .then(ClientMessageConverter.turnToJson);

    return turn.then((t) => {
      this.server.sendJson(t);
      return this.server.readJson();
    });
  }

}

module.exports = RemoteProxyReferee;