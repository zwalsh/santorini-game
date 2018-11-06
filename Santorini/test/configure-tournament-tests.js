const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

const Player = require('../Player/player');
const BrokenPlayer = require('../Player/player-breaker');
const InfinitePlayer = require('../Player/player-infinite');
const GuardedPlayer = require('./guarded-player');
const configureTournament = require('../Admin/configure-tournament').configureTournament;
const testLib = require('./test-lib');

const good = "good";
const breaker = "breaker";
const infinite = "infinite";
const ppath = "../Player/player";
const bpath = "../Player/player";
const ipath = "../Player/player";

/*
{ "players"   : [[Kind, Name, PathString], ..., [Kind, Name, PathString]],

    "observers" : [[Name, PathString], ..., [Name, PathString]]}

- no double loading
- loads correct path string? seems useless to test
- creates players and gives them to name checker
- creates tournament with players returned from name checker
*/

function createConfigString(playerArr, observerArr) {
  let configObj = {
    players : playerArr,
    observers : observerArr
  };
  return JSON.stringify(configObj);
}

describe('configureTournament', function () {
  let configString;
  let player1, player2, breaker1, infinite1;
  let pname1, pname2, bname1, iname1;
  beforeEach(function () {
    pname1 = "player1";
    pname2 = "player2";
    bname1 = "breaker1";
    iname1 = "infinite1";
    player1 = new Player(pname1);
    player2 = new Player(pname2);
    breaker1 = new BrokenPlayer(pname1);
    infinite1 = new InfinitePlayer(pname1);
  });
  describe('when it is asked for the same component (same PathString) twice', function () {
    beforeEach(function () {
      configString = createConfigString([[good, pname1, ppath], [good, pname2, ppath]], []);
    });
    it('loads the first component from the PathString', function () {
      // check prepend ./ to string, then require it
    });
    it('does not try to load the component from the PathString again', function () {

    });
  });
  describe('when the loaded component fails to be constructed', function () {
    it('does not include the player in the Tournament', function () {

    });
  });
  describe('when it uses ensureUniqueNames', function () {
    let ensureUniqueNames;
    beforeEach(function () {
      ensureUniqueNames = sinon.stub();
    });
    it('gives ensureUniqueNames a list of GuardedPlayers', function () {

    });
    describe('when the player name checker discards a Player', function () {
      it('does not include that Player in the final Tournament', function () {

      });
    });
    describe('when the player name checker does not return enough Players to start a Tournament', function () {
      beforeEach(function () {
        ensureUniqueNames.returns([player1]);
      });
      it('configureTournament throws an exception', function () {

      });
    });
  });
});









