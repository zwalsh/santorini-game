// not part of the deliverables - used to test our server for task 1 to make sure we were able to send the JSON at the right time

const net = require('net');

const startClient = () => {
  const client = new net.Socket({
    readable: true,
    writable: true,
  });
  
  client.connect(8000, '127.0.0.1', () => {
    console.log('Client connected on 127.0.0.1:8000');
  });

  process.stdin.on('data', input => {
    client.write(input);
  });

  process.stdin.on('end', () => {
    client.write('^D');
  });

  client.on('data', data => {
    process.stdout.write(data.toString());
  });
};

startClient();
