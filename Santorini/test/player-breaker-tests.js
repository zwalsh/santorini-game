const chai = require('chai');
const assert = chai.assert;
const RFC = require('../Common/request-format-checker');
const Board = require('../Common/board');
const BrokenPlayer = require('../Player/player-breaker');

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
        assert.isFalse(RFC.isWellFormedPlaceReq(placeReq));
      });
    });
  });

  describe('when asked for a Turn', function () {
    it('returns an invalid Turn', function () {
      return player.takeTurn(new Board(initWorkers)).then((turn) => {
        assert.isFalse(RFC.isWellFormedTurn(turn));
      });
    });
  });
});