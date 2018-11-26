/*
  Accepts a Santorini client configuration as a string,
  and creates SantoriniClients from the configuration.

  The configuration will be a stringified JSON object with this form:

  {
    "players"   : [[Kind, Name, PathString], ..., [Kind, Name, PathString]],

    "observers" : [[Name, PathString], ..., [Name, PathString]],

    "ip"        : String,

    "port"      : Number
  }


*/
const net = require('net');

const createPlayers = require('../Admin/configure-tournament').createPlayers;
const SantoriniClient = require('./client');

/* String -> [Maybe [SantoriniClient, ...]]
  Create a list of SantoriniClients from the given configuration string,
  if the configuration is well-formed.
*/
function createClients(configStr) {
  let maybeConfig = parseConfig(configStr);
  if (maybeConfig === false) {
    return false;
  }
  let playerConfigs = maybeConfig['players'];
  let ip = maybeConfig['ip'];
  let port = maybeConfig['port'];

  let players = createPlayers(playerConfigs);
  let clients = players.map((p) => { return createClient(p, ip, port); });
  return clients;
}

/* GuardedPlayer String Natural -> SantoriniClient
  Create a socket from the connection information,
  and create a client with that and the player.
*/
function createClient(player, ip, port) {
  let socket = net.createConnection(port, ip);
  return new SantoriniClient(player, socket);
}

/* String -> [Maybe Configuration]
  Parse the configuration string to a JSON object and check that
  the data inside is all well-formed. If not, return false.
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
  let players = config['players'];
  let observers = config['observers'];
  let ip = config['ip'];
  let port = config['port'];

  if (!(Array.isArray(players) && players.every(checkPlayer))) {
    return false;
  }
  if (!(Array.isArray(observers) && observers.every(checkObserver))) {
    return false;
  }
  if (typeof ip !== 'string') {
    return false;
  }
  if (!(Number.isInteger(port) && port >= 50000 && port <= 60000)) {
    return false;
  }

  return config;
}

/* Any -> Boolean
  Check if the value represents a valid PlayerConfig
*/
function checkPlayer(playerConfig) {
  return Array.isArray(playerConfig) &&
    playerConfig.length === 3  &&
    typeof playerConfig[0] === 'string' &&
    ['good', 'breaker', 'infinite'].includes(playerConfig[0]) &&
    typeof playerConfig[1] === 'string' &&
    typeof playerConfig[2] === 'string';
}

/* Any -> Boolean
  Check if the value represents a valid ObserverConfig
*/
function checkObserver(observerConfig) {
  return Array.isArray(observerConfig) &&
    observerConfig.length === 2  &&
    typeof observerConfig[0] === 'string' &&
    typeof observerConfig[1] === 'string';
}

module.exports.createClients = createClients;

