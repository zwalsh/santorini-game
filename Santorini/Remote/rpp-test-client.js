const net = require('net');

let socket = net.createConnection(50000, '127.0.0.1');

socket.on('data', function (data) {
  if (data) {
    process.stdout.write(data + '\n');
  }
});

socket.on('end', function () {
  process.exit(0);
});

process.stdin.on('data', function (data) {
  if (data) {
    socket.write(data);
    console.log(`sent ${data} to server`);
  }
});
