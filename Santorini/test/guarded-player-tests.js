const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const assert = chai.assert;

const testLib = require('./test-lib');

const GuardedPlayer = require('../Admin/guarded-player');

describe('GuardedPlayer tests', function () {
  let guardedPlayer, player;
  describe('takeTurn', function () {
    let turn;
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
  describe('setId', function () {
    beforeEach(function () {
      player = testLib.createMockObject('setId');
      guardedPlayer = new GuardedPlayer(player, 1000);
    });
    it('later returns the given id', function () {
      player.setId.resolves();
      let newId = 'i-<3-javascript';
      return guardedPlayer.setId(newId).then(() => {
        expect(player.setId.called).to.be.true;
        return expect(guardedPlayer.getId()).to.eql(newId);
      });
    });
    it('rejects when the player rejects', function () {
      player.setId.rejects();
      return assert.isRejected(guardedPlayer.setId(''));
    });
  });
});