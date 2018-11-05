/*
  This component reads in a Santorini configuration file from stdin and creates
  a TournamentManager with the players and observers specified in the configuration file.

  It uses the [other component] to ensure that all players have unique names
  before giving the players to the TournamentManager.


 */

const Player = require('../Player/player');
const BrokenPlayer = require('../Player/player-breaker');
const InfinitePlayer = require('../Player/player-infinite');
const GuardedPlayer = require('./guarded-player');

const TournamentManager = require('./tournament-manager');
const TournamentResult = require('./tournament-result');
