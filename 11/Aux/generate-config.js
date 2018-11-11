/*
  {
    "players" : [
      [Kind, Name, Path],
      ...
      ],
    "observers" : [ [], ...]
  }

   { "players"   : [[Kind, Name, PathString], ..., [Kind, Name, PathString]],

    "observers" : [[Name, PathString], ..., [Name, PathString]]}

name can be "" actually, the config mgr will take care of unique names



 */

const good = 'good';
const breaker = 'breaker';
const infinite = 'infinite';

const goodPath = '../../Santorini/Player/player.js';
const breakerPath = '../../Santorini/Player/player-all-breaker.js';
const turnBreakerPath = '../../Santorini/Player/player-turn-breaker.js';
const infinitePath = '../../Santorini/Player/player-infinite.js';

/* Void -> String
  Generator function that makes unique names for players
 */
function* nameGenerator() {
  let alphabet = "abcdefghijklmnopqrstuvwxyz".split('');
  for (let i = 0; i < alphabet.length; i++) {
    yield alphabet[i];
  }
}

/* Number Number -> String
  Generate a configuration string with the given number of
  player and observer configs.
 */
function generateConfigString(numPlayers, numObservers = 0) {
  return JSON.stringify(generateConfigObject(numPlayers, numObservers));
}

/* Void -> ConfigObject
  Generate a configuration object with the given number of
  player and observer configs.
 */
function generateConfigObject(numPlayers, numObservers) {
  let obj = {};
  obj.players = generatePlayers(numPlayers);
  obj.observers = generateObservers(numObservers);

  return obj;
}

/* Number -> [PlayerConfig, ...]
  Generate an array of n random PlayerConfigs
 */
function generatePlayers(n) {
  let playerConfigs = [];
  let nameGen = nameGenerator();
  for (let i = 0; i < n; i++) {
    let name = nameGen.next().value;
    playerConfigs.push(randomPlayerConfig(name));
  }
  return playerConfigs;
}

/* Number -> [ObserverConfig, ...]
  Generate an array of n random ObserverConfigs
 */
function generateObservers(n) {
  return [];
}

/* String -> PlayerConfig
  Generate a random PlayerConfig
 */
function randomPlayerConfig(name) {
  let playerKind = Math.floor(Math.random() * 4);
  let playerConfig;
  switch (playerKind) {
    case 0: playerConfig = [good, name, goodPath];
      break;
    case 1: playerConfig = [breaker, name, breakerPath];
      break;
    case 2: playerConfig = [infinite, name, infinitePath];
      break;
    case 3: playerConfig = [breaker, name, turnBreakerPath];
    default:
  }
  return playerConfig;
}



// input: a number
// write output: config string
process.stdin.on('readable', () => {
  let chunk = process.stdin.read();
  if (chunk != null) {
    let num = Number.parseInt(chunk);
    if (Number.isInteger(num)) {
      process.stdout.write(generateConfigString(num));
    }
  }
});











