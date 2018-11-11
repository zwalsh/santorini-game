const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const InfinitePlayer = require('../Player/player-infinite');
const Board = require('../Common/board');
const constants = require('../Common/constants');
const uuid = require('uuid/v4');

describe('InfinitePlayer', function () {
  let infinitePlayer;
  beforeEach(function () {
    infinitePlayer = new InfinitePlayer("name");
  });
  describe('all functions return Promises', function () {
    it('placeInitialWorker', function () {
      let value = infinitePlayer.placeInitialWorker([]);
      assert.isTrue(value instanceof Promise);
    });
    it('takeTurn', function () {
      let value = infinitePlayer.takeTurn(new Board([]));
      assert.isTrue(value instanceof Promise);
    });
    it('newGame', function () {
      let value = infinitePlayer.newGame();
      assert.isTrue(value instanceof Promise);
    });
    it('notifyGameOver', function () {
      let value = infinitePlayer.notifyGameOver(["a", constants.EndGameReason.WON]);
      assert.isTrue(value instanceof Promise);
    });
  });
  describe('no returned Promises resolve (within a timeout)', function () {
    function promiseDoesNotResolve(p) {
      let resolveUUID = uuid();
      let timeout = new Promise(resolve => {
        setTimeout(function () {
          return resolve(resolveUUID);
        }, 50); // only checking with a timeout of 50ms to avoid slow unit tests
      });
      return Promise.race([p, timeout]).then((val) => {
        return assert.equal(val, resolveUUID);
      });
    }

    it('placeInitialWorker', function () {
      let promise = infinitePlayer.placeInitialWorker([]);
      return promiseDoesNotResolve(promise);
    });
    it('takeTurn', function () {
      let promise = infinitePlayer.takeTurn(new Board([]));
      return promiseDoesNotResolve(promise);
    });
    it('newGame', function () {
      let promise = infinitePlayer.newGame("a");
      return promiseDoesNotResolve(promise);
    });
    it('notifyGameOver', function () {
      let promise = infinitePlayer.notifyGameOver(["a", constants.EndGameReason.WON]);
      return promiseDoesNotResolve(promise);
    });
  });
});