const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const assert = chai.assert;
const RFC = require('../Common/request-format-checker');
const Board = require('../Common/board');
const BrokenPlayer = require('../Player/player-all-breaker');

describe('Broken Player', function () {
  let player, initWorkers;
  beforeEach(function () {
    let playerId = "you";
    player = new BrokenPlayer(playerId);
    player.newGame(playerId);
    initWorkers = [];
  });

  describe('when asked for a PlaceRequest', function () {
    it('returns an invalid PlaceRequest', function () {
      return player.placeInitialWorker(initWorkers).then((placeReq) => {
        return assert.isFalse(RFC.isWellFormedPlaceReq(placeReq));
      });
    });
  });

  describe('when asked for a Turn', function () {
    it('returns an invalid Turn', function () {
      return player.takeTurn(new Board(initWorkers)).then((turn) => {
        return assert.isFalse(RFC.isWellFormedTurn(turn));
      });
    });
  });

  describe('when told that a Tournament is over', function () {
    it('returns a promise that rejects', function () {
      return assert.isRejected(player.notifyTournamentOver([]));
    });
  });
});