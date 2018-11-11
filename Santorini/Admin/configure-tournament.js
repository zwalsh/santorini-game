/*
  This component accepts a Santorini tournament configuration as a string, and creates
  a TournamentManager with the players and observers specified in that configuration.

  All player names must alphabetic, lowercase only, and unique.
  It uses the player name checking component to ensure that all players have unique
  and well-formed names before giving the players to the TournamentManager.

  Players are discarded before the tournament begins if:
  - their PathStrings produce components that cannot be constructed
  - the player name checker cannot ensure they have a well-formed and unique name


  ============= Data Definitions ================

  The definition of GuardedPlayer is in guarded-player.js
  The definition of Player is in Player/player.js
  The definition of BrokenPlayer is in Player/player-all-breaker.js
  The definition of InfinitePlayer is in Player/player-infinite.js
  The definition of TournamentManager is in tournament-manager.js

  A PlayerConfig is a [Kind, Name, PathString]
  An ObserverConfig is a [Name, PathString]

  Kind is one of:
  - "good"
  - "breaker"
  - "infinite"

  Name is a String

  PathString is a String that specifies a Linux path to a component
 */

const jsonParser = require('../Common/json-to-component').jsonParser;
const ensureUniqueNames = require('./player-name-checker').ensureUniqueNames;

const Player = require('../Player/player');
const BrokenPlayer = require('../Player/player-all-breaker');
const InfinitePlayer = require('../Player/player-infinite');
const GuardedPlayer = require('./guarded-player');

const TournamentManager = require('./tournament-manager');
const TournamentResult = require('./tournament-result');

const SERIES_LENGTH = 3;
const TIMEOUT = 2000;

/* String -> TournamentManager
  Given a configuration string, parse the config to JSON,
  create the players from the files and check the player names,
  and return a TournamentManager with the specified players.
 */
function configureTournament(configString) {
  let configObj = jsonParser(configString)[0];
  let playerConfigs = configObj.players;
  let observerConfigs = configObj.observers;

  let players = createPlayers(playerConfigs);
  let observers = createObservers(observerConfigs);

  return ensureUniqueNames(players).then((uniquelyNamedPlayers) => {
    return createTournament(uniquelyNamedPlayers, observers);
  });
}

/* [GuardedPlayer, ...] [Observer, ...] -> TournamentManager
  Create a TournamentManager with the given Players (and Observers, except not)
  if there are enough.
*/
function createTournament(players, observers) {
  if (players.length < 2) {
    throw new Error('Not enough Players to start a tournament');
  }
  return new TournamentManager(players, SERIES_LENGTH);
}

/* [PlayerConfig, ...] -> [GuardedPlayer, ...]
  Given a list of PlayerConfigs, attempt to create each specified Player,
  and return the successfully created ones in a list.
*/
function createPlayers(playerConfigs) {
  // Map of path strings to loaded Player classes
  let loadedComponentMap = new Map();
  let players = [];
  for (let playerConfig of playerConfigs) {
    let name = playerConfig[1];
    let path = playerConfig[2];
    let maybePlayer = createComponent(name, path, loadedComponentMap);

    if (maybePlayer) {
      players.push(new GuardedPlayer(maybePlayer, name, TIMEOUT));
    }
  }
  return players;
}

/* [ObserverConfig, ...] -> [Observer, ...]
  Given a list of ObserverConfigs, attempt to create each specified Observer,
  and return the successfully created ones in a list.
*/
function createObservers(observerConfigs) {
  // Map of path strings to loaded Observer classes
  let loadedComponentMap = new Map();
  let observers = [];
  for (let observerConfig of observerConfigs) {
    let name = observerConfig[0];
    let path = observerConfig[1];
    let maybeObserver = createComponent(name, path, loadedComponentMap);

    if (maybeObserver) {
      observers.push(maybeObserver);
    }
  }
  return observers;
}

/* [Kind, Name, PathString] Map<PathString, Object> -> [Maybe Object]
  Given a component specification, load the component from the file
  if it was not already loaded, and return an instance of it with the
  given name, if the component can be instantiated.
*/
function createComponent(name, pathstring, loadedComponentMap) {
  if (!loadedComponentMap.has(pathstring)) {
    let loadablePathStr = './' + pathstring;
    try {
      loadedComponentMap.set(pathstring, require(loadablePathStr));
    } catch (err) {
      return false;
    }
  }
  let Component = loadedComponentMap.get(pathstring);
  try {
    let cmp = new Component(name);
    return cmp;
  } catch (err) {
    return false;
  }
}


module.exports = {
  'configureTournament' : configureTournament,
  'createPlayers' : createPlayers,
  'createObservers' : createObservers,
  'createComponent' : createComponent
};








