/*
  Wraps a socket such that JSON values may be sent and received over
  the socket using Promises.

  When given JSON values to send, it immediately sends them over the connection.

  It buffers incoming JSON values, storing them internally until they
  are requested.

  If non-JSON input is received, the module will no longer attempt to read or store
  any additional messages from the socket. It will not close the socket.
  Any unread values may still be requested until the buffer queue is empty.

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
    this.socket = socket;
    this.socketOpen = true;
    // for testing purposes, don't set the callback if a Socket is not given
    if (socket) {
      socket.on('data', (data) => { this.receiveData(data) });
      socket.on('close', () => { this.socketOpen = false });
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
      if (this.socketOpen) {
        return new Promise((res) => {
          this.readJsonCallback = res;
          return;
        });
      } else {
        return Promise.reject(new Error('Cannot read from closed socket.'));
      }
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
    if (data && this.socketOpen) {
      this.bufferedInput += data;

      let parsed;
      try {
        parsed = parseJson(this.bufferedInput);
      } catch (err) {
        this.socketOpen = false;
        this.bufferedInput = "";
        return;
      }

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