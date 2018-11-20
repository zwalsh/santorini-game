const net = require('net');

let socket = net.createConnection(54321, '127.0.0.1');

socket.on('data', function (data) {
  if (data) {
    process.stdout.write(data + '\n');
  }
});

process.stdin.on('data', function (data) {
  if (data) {
    socket.write(data);
    console.log(`sent ${data} to server`);
  }
});
