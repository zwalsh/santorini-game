const net = require('net');
const Parse = require('../../../2/Auxilary/src/parse');

// detect a command to close out the client connection and return JSON objects
const CLOSE_COMMAND = '^D';

// Main function to start the server to listen for input through TCP
const startServer = () => {
  // logging to show the server is running
  process.stdout.write('Server started on 127.0.0.1:8000\r\n');

  // initialize store and buffer for the server session
  const store = [];
  let buffer = '';

  // create the server connection
  net.createServer(socket => {
    // use UTF-8 encoding for easier parsing over Buffers
    socket.setEncoding('utf-8');

    // on incoming data, parse the strings as JSON objects
    socket.on('data', data => {
      // Listen for a close
      if (data === CLOSE_COMMAND) {
        // build up the output to send in the final .end() command
        let res = '';
        Parse.indexStore(store).forEach(entry => {
          res += `${entry}\n`;
        });
        // return the JSON object and close the client connection
        socket.end(res);
      } else {
        // otherwise parse JSON object and add to store - if valid
        Parse.parse(data, store, buffer);
      }
    });
  }).listen(8000, '127.0.0.1');
};

startServer();
