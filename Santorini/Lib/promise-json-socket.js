/*
  Wraps a socket such that JSON values may be sent and received over
  the socket using Promises.

  It buffers incoming JSON values, storing them internally until they
  are requested.

  It immediately sends JSON values over the connection.
*/
const JsonSocket = require('json-socket');

class PromiseJsonSocket {
  /* Socket -> PromiseJsonSocket
    Constructs a PromiseJsonSocket that wraps the given Socket.
  */
  constructor(socket) {
    // for testing purposes, don't create a JsonSocket if a Socket is not given
    if (socket) {
      this.socket = new JsonSocket(socket);
      socket.on('message', this.receiveJsonMessage);
    }
    this.receivedMessageQueue = [];
    this.readJsonCallback = null;
  }

  /* JSON -> Void
    Sends the given JSON message on the socket.
  */
  sendJson(json) {
    this.socket.sendMessage(json);
  }

  /* Void -> Promise<JSON>
    Returns the next JSON value received. These values are buffered
    and returned only when asked for.
  */
  readJson() {
    if (this.receivedMessageQueue.length > 0) {
      return Promise.resolve(this.receivedMessageQueue.shift());
    } else {
      return new Promise((res) => {
        this.readJsonCallback = res;
        return;
      });
    }
  }

  /* JSON -> Void
    Handle JSON messages coming in over the socket:
    - call the resolve function if a readJson() caller is waiting on a value
    - otherwise, put it on the queue for future use
  */
  receiveJsonMessage(json) {
    if (this.readJsonCallback) {
      this.readJsonCallback(json);
      this.readJsonCallback = null;
    } else {
      this.receivedMessageQueue.push(json);
    }
  }
}

module.exports = PromiseJsonSocket;