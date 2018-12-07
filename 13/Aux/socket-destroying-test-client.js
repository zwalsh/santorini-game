const net = require('net');

let socket = net.createConnection(55556, 'localhost');

socket.on('error', (err) => {
  console.log(err.stack);
});

let responses = [
  [0,5]
];

socket.on('data', function (data) {
  if (data) {
    process.stdout.write(data + '\n');
    let response = responses.shift();
    socket.write(JSON.stringify(response));
    if (responses.length === 0) {
      socket.destroy();
    }
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
