/*
  Script that the `xserver` executable uses to start a server from
  a configuration file.

  Read in a config file from stdin, use the server configuration
  reader to construct and start the specified server.
*/

const ServerMessageConverter = require('../../Santorini/Remote/server-message-converter');
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
    return server.startAndReturnResults().then((tournamentResult) => {
      printResults(tournamentResult);
      process.exit(0);
    });
  } else {
    process.stdout.write('Invalid configuration, cannot start server.\n');
    return process.exit(1);
  }
}

/* TournamentResult -> Void
  Get the game results from the TournamentResult and print them as a list
  of EncounterOutcomes
*/
function printResults(tournamentResult) {
  let matchResults = tournamentResult.matchTable.getAllMatchResults();
  let encounterOutcomes = ServerMessageConverter.gameResultsToJson(matchResults);
  process.stdout.write(JSON.stringify(encounterOutcomes) + '\n');
}
