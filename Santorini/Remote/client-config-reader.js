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

const createPlayers = require('../Admin/configure-tournament').createPlayers;
const SantoriniClient = require('./client');

/* String -> [Maybe [SantoriniClient, ...]]
  Create a list of SantoriniClients from the given configuration string,
  if the configuration is well-formed.
*/
function createClients(configStr) {

}

/* String -> [Maybe Configuration]
  Parse the configuration string to a JSON object and check that
  the data inside is all well-formed. If not, return false.
*/
function parseConfig() {

}

module.exports.createClients = createClients;

