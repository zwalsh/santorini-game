const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const assert = chai.assert;

const testLib = require('./test-lib');

const GuardedPlayer = require('../Admin/guarded-player');

describe('GuardedPlayer tests', function () {
  describe('protectedPromise', function () {
    let guardedPlayer, timeout;
    beforeEach(function () {
      timeout = 25; // in milliseconds
      guardedPlayer = new GuardedPlayer(null, timeout);
    });
    describe('the Promise from the Player resolves', function () {
      it('the GuardedPlayer\'s Promise resolves with the result from the Player', function () {
        let playerPromiseFn = (p) => {
          return new Promise((resolve => {
            setTimeout(resolve, timeout / 2, "succeeded");
          }));
        };
        let protectedPromise = guardedPlayer.protectedPromise(playerPromiseFn);
        return expect(protectedPromise).to.eventually.eql("succeeded");
      });
    });
    describe('the Promise from the Player times out', function () {
      it('the GuardedPlayer\'s Promise rejects with the result from the timeout Promise', function () {
        let playerPromiseFn = (p) => {
          return new Promise((resolve => {
            setTimeout(resolve, timeout * 420, "succeeded");
          }));
        };
        let protectedPromise = guardedPlayer.protectedPromise(playerPromiseFn);
        return assert.isRejected(protectedPromise);
      });
    });
    // this test passes but warns about an unhandled Promise rejection (reason unknown)
    xdescribe('the Player errors when asked for a Promise', function () {
      it('the GuardedPlayer\'s Promise rejects', function () {
        let playerPromiseFn = (p) => {
          throw new Error('this is not a Promise!');
        };
        let protectedPromise = guardedPlayer.protectedPromise(playerPromiseFn);
        return assert.isRejected(protectedPromise);
      });
    });
    // this test passes but warns about an unhandled Promise rejection (reason unknown)
    xdescribe('the Player provides something other than a Promise', function () {
      it('the GuardedPlayer\'s Promise rejects with the result from the timeout Promise', function () {
        let playerPromiseFn = (p) => {
          return 5; // 5 is not a promise
        };
        let protectedPromise = guardedPlayer.protectedPromise(playerPromiseFn);
        return assert.isRejected(protectedPromise);
      });
    });
  });
  describe('takeTurn', function () {
    let guardedPlayer, player, turn;
    beforeEach(function () {
      player = testLib.createMockObject('takeTurn');
      guardedPlayer = new GuardedPlayer(player, 10);
      turn = "fake turn";
      player.takeTurn.returns(Promise.resolve(turn));
    });
    it('returns the value given by the player', function () {
      let guardedPromise = guardedPlayer.takeTurn("board");
      expect(player.takeTurn.calledWith("board")).to.be.true;
      return expect(guardedPromise).to.eventually.eql(turn);
    });
  });
});