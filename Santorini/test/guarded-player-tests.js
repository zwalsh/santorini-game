const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;

const testLib = require('./test-lib');

const GuardedPlayer = require('../Admin/guarded-player');

describe('GuardedPlayer tests', function () {

  describe('takeTurn', function () {
    let guardedPlayer, player, turn;
    beforeEach(function () {
      player = testLib.createMockObject('takeTurn');
      guardedPlayer = new GuardedPlayer(player, 10);
      turn = "fake turn";
      player.takeTurn.resolves(turn);
    });
    it('returns the value given by the player', function () {
      let guardedPromise = guardedPlayer.takeTurn("board");
      expect(player.takeTurn.calledWith("board")).to.be.true;
      return expect(guardedPromise).to.eventually.eql(turn);
    });
  });
});