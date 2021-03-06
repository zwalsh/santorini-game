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
const RFC = require('../Common/request-format-checker');

class RemoteProxyReferee {

  /* GuardedPlayer PromiseJsonSocket -> RPR
    Create a RemoteProxyReferee to take the given player through
    a game occurring on the other side of the socket.
  */
  constructor (player, socket) {
    this.player = player;
    this.server = socket;
    this.opponent = null;
  }

  /* String -> Promise<JSON>
    Start a game between the player and an opponent with the given name.
    Resolve with the next unrecognized (non-game-level) message
    received from the server.
  */
  startSeries(name) {
    this.opponent = name;
    return this.player.newGame(name).then(() => {
      return this.server.readJson()
    }).then((val) => {
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
    //console.log(this.player.getId() + ' received msg: ' + JSON.stringify(msg));
    if (ClientMessageFormChecker.checkBoard(msg)) {
      return this.handleTakeTurn(msg).then((nextMessage) => {
        return this.handleGameMessage(nextMessage);
      });
    } else if (ClientMessageFormChecker.checkPlacement(msg)) {
      return this.handlePlacement(msg).then((nextMessage) => {
        return this.handleGameMessage(nextMessage);
      });
    } else {
      //console.log(this.player.getId() + " game over with msg " + JSON.stringify(msg));
      return Promise.resolve(msg);
    }
  }

  /* Placement -> Promise<JSON>
    Convert the Placement to a placeInitialWorker() method call
    on the player. Send the player's response back to the server.

    Resolve with the next message received from the server.
  */
  handlePlacement(placement) {
    //console.log(this.player.getId() + ' making placement ' + JSON.stringify(placement));
    let initWorkerList = ClientMessageConverter.jsonToInitWorkerList(placement);
    let informPlayerOfNewGame = new Promise(resolve => {
      if (initWorkerList.length === 0 || initWorkerList.length === 1) {
        this.player.newGame(this.opponent).then(resolve);
      } else {
        resolve();
      }
    });

    let workerPlacement = informPlayerOfNewGame.then(() => {
      return this.player.placeInitialWorker(initWorkerList)
        .then((playerPlaceReq) => {
          if (RFC.isWellFormedPlaceReq(playerPlaceReq)) {
            return ClientMessageConverter.placeRequestToJson(playerPlaceReq);
          } else {
            return Promise.reject(new Error('Player provided an invalid place request.'));
          }
        });
    });

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
      .then((playerTurn) => {
        if (RFC.isWellFormedTurn(playerTurn)) {
          return ClientMessageConverter.turnToJson(playerTurn);
        } else {
          return Promise.reject(new Error('Player provided an invalid turn.'));
        }
      });

    return turn.then((t) => {
      this.server.sendJson(t);
      return this.server.readJson();
    });
  }

}

module.exports = RemoteProxyReferee;