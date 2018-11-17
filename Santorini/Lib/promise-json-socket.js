/*
  Wraps a socket such that JSON values may be sent and received over
  the socket using Promises.

  It buffers incoming JSON values, storing them internally until they
  are requested.

  It immediately sends JSON values over the connection.
*/
const parseJson = require('./json-parser').jsonParser;

class PromiseJsonSocket {
  /* Socket -> PromiseJsonSocket
    Constructs a PromiseJsonSocket that wraps the given Socket.
  */
  constructor(socket) {
    this.receivedMessageQueue = [];
    this.readJsonCallback = null;
    this.bufferedInput = "";
    // for testing purposes, don't create a JsonSocket if a Socket is not given
    if (socket) {
      this.socket = socket;
      socket.on('data', (data) => { this.receiveData(data) });
    }
  }

  /* JSON -> Void
    Sends the given JSON message on the socket.
  */
  sendJson(json) {
    this.socket.write(JSON.stringify(json));
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

  /* String -> Void
    Receives JSON over the wire, buffers it, and parses it into complete JSON
    if possible. Hands complete values off to the handler for JSON messages.
  */
  receiveData(data) {
    if (data) {
      this.bufferedInput = this.bufferedInput + data;
      let parsed = parseJson(this.bufferedInput);
      if (parsed.length > 0) {
        for (let json of parsed) {
          this.receiveJsonMessage(json);
        }
        this.bufferedInput = "";
      }
    }
  }
}

module.exports = PromiseJsonSocket;