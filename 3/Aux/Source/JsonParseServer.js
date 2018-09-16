const net = require('net');
const JsonParse = require('./lib/JsonParse.js');
const { StringDecoder } = require('string_decoder');


const server = net.createServer({ "allowHalfOpen":true }, function(socket) {
  const decoder = new StringDecoder('utf8');
  let buffer = "";
  socket.on('data', function(chunk) {
    let decoded = decoder.write(chunk);
    buffer += decoded;
    //console.log("Received: " + decoded);
  });

  socket.on('end', function() {
    let data = JsonParse.parseAndFormatInputString(buffer);
    //console.log("Final data sent back:  " + data);
    socket.end(data);
    buffer = "";
  });
});

server.listen(8000, '127.0.0.1');
