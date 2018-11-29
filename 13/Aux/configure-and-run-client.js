/*
  Script that xclients will call to start up a series of clients and
  connect them to a running server.
*/

const createClients = require('../../Santorini/Remote/client-config-reader').createClients;

process.stdin.setEncoding('utf-8');

process.stdin.on('readable', () => {
  let chunk = process.stdin.read();
  if (chunk != null) {
    configureAndRunClients(chunk);
  }
});

/* String -> Void
  Pass the config to the client config reader, and run all the clients
  that the reader produces.
*/
function configureAndRunClients(chunk) {
  return createClients(chunk).then((maybeClients) => {
    if (maybeClients === false) {
      process.stdout.write('Invalid configuration, cannot start clients.\n');
      process.exit(1);
    } else {
      let timeout = 0;
      let timeoutIncrement = 1000;
      maybeClients.forEach((c) => {
        timeout += timeoutIncrement;
        setTimeout(() => {
          c.start();
        }, timeout);
      });
    }
  });
}
