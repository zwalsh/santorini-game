/*
  Accepts a Santorini server configuration as a string,
  and creates a SantoriniServer from the configuration.

  A configuration will be a string containing a JSON object with
  the following form:

    {
      "min players" : Natural,

      "port"        : [50000, 60000],

      "waiting for" : Natural,

      "repeat"      : {0|1}
    }

  "waiting for" specifies the minimum number of seconds to wait for before
  starting a tournament.

  "min players" specifies the minimum number of player connections to
  wait for before starting a tournament.

  "repeat" is 0 if the server will shut down after one complete tournament,
  or 1 if it will run an arbitrary number of tournaments (closing
  player connections after each tournament).

 */

const parseJson = require('../Lib/json-parser').jsonParser;

/* String -> [Maybe SantoriniServer]
  Creates a SantoriniServer from the configuration specified in the
  string, if the config is valid.
*/
function createServer(configStr) {
  let maybeConfig = parseConfig(configStr);
  if (maybeConfig) {
    let minPlayers = maybeConfig["min players"];
    let port = maybeConfig["port"];
    let waitingFor = maybeConfig["waiting for"];
    let repeat = maybeConfig["repeat"];
    // todo use TournamentServer
    // return new SantoriniServer(minPlayers, port, waitingFor, repeat);
  }
  return false;
}

/* String -> [Maybe Configuration]
  Parse the string to a Configuration object and verify that the
  Configuration is well-formed before returning it.
 */
function parseConfig(configStr) {
  let parsedJson;
  try {
    parsedJson = parseJson(configStr);
  } catch (err) {
    return false;
  }
  if (parsedJson.length !== 1) {
    return false;
  }
  let config = parsedJson[0];
  let keys = Object.keys(config);
  if (keys.length !== 4) {
    return false;
  }
  let minPlayers = config["min players"];
  let port = config["port"];
  let waitingFor = config["waiting for"];
  let repeat = config["repeat"];

  if (!(Number.isInteger(minPlayers) && minPlayers > 0)) {
    return false;
  }
  if (!(Number.isInteger(port) && port >= 50000 && port <= 60000)) {
    return false;
  }
  if (!(Number.isInteger(waitingFor) && waitingFor > 0)) {
    return false;
  }
  if (!(Number.isInteger(repeat) && (repeat === 0 || repeat === 1))) {
    return false;
  }
  return config;
}

module.exports = {
  'createServer': createServer
};



