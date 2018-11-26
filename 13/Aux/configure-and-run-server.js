/*
  Script that the `xserver` executable uses to start a server from
  a configuration file.

  Read in a config file from stdin, use the server configuration
  reader to construct and start the specified server.
*/

const createServer = require('../../Santorini/Remote/server-config-reader').createServer;

process.stdin.setEncoding('utf8');

process.stdin.on('readable', () => {
  let chunk = process.stdin.read();
  if (chunk != null) {
    configureAndRunServer(chunk);
  }
});

/* String -> Void
  Parse the input configuration string
*/
function configureAndRunServer(configStr) {
  let server = createServer(configStr);
  if (server) {
    return server.start();
  } else {
    process.stdout.write('Invalid configuration, cannot start server.\n');
    return process.exit(1);
  }
}
