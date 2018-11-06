const chai = require('chai');
const expect = chai.expect;

const ensureUniqueNames = require('../Admin/player-name-checker').ensureUniqueNames;
const testLib = require('./test-lib');

describe('PlayerNameChecker', function () {
  let playerList, getId = 'getId', setId = 'setId';
  let gp1, gp2, gp3;
  beforeEach(function () {
    gp1 = testLib.createMockObject(getId, setId);
    gp1.getId = sinon.stub().returns('p1');
    gp1.setId = sinon.stub().resolves();

    gp2 = testLib.createMockObject(getId, setId);
    gp2.getId = sinon.stub().returns('p2');
    gp2.setId = sinon.stub().resolves();

    gp3 = testLib.createMockObject(getId, setId);
    gp3.getId = sinon.stub().returns('p3');
    gp3.setId = sinon.stub().resolves();

    playerList = [gp1, gp2, gp3];
  });
  describe('when given all uniquely named players', function () {
    it('returns the list, unchanged', function () {
      assert.deepEqual(ensureUniqueNames(playerList), [gp1, gp2, gp3]);
    });
  });
  describe('when given players with some repeating names', function () {
    let repeatedNamePlayer, repeatedNameBadPlayer;
    beforeEach(function () {

    });
    it('renames the players with repeating names', function () {

    });
    it('removes players that do not accept the name change', function () {

    });
  });
  describe('when given players with improperly formed names', function () {

    it('removes them', function () {

    });
  });
});