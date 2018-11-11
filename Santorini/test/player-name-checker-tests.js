const chai = require('chai');
const sinon = require('sinon');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;

const ensureUniqueNames = require('../Admin/player-name-checker').ensureUniqueNames;
const testLib = require('./test-lib');

describe('PlayerNameChecker', function () {
  let playerList, getId = 'getId', setId = 'setId';
  let gp1, gp2, gp3;
  let p1Id, p2Id, p3Id;
  beforeEach(function () {
    gp1 = testLib.createMockObject(getId, setId);
    p1Id = 'pone';
    gp1.getId = sinon.stub().returns(p1Id);
    gp1.setId = sinon.stub().resolves();

    gp2 = testLib.createMockObject(getId, setId);
    p2Id = 'ptwo';
    gp2.getId = sinon.stub().returns(p2Id);
    gp2.setId = sinon.stub().resolves();

    gp3 = testLib.createMockObject(getId, setId);
    p3Id = 'pthree';
    gp3.getId = sinon.stub().returns(p3Id);
    gp3.setId = sinon.stub().resolves();

    playerList = [gp1, gp2, gp3];
  });
  describe('when given all uniquely named players', function () {
    it('returns the list, unchanged', function () {
      return expect(ensureUniqueNames(playerList)).to.eventually.deep.eql([gp1, gp2, gp3]);
    });
  });
  describe('when given players with some repeating names', function () {
    let repeatedNamePlayer, repeatedNameBadPlayer;
    beforeEach(function () {
      repeatedNamePlayer = testLib.createMockObject(getId, setId);
      repeatedNamePlayer.getId.returns(p1Id);
      repeatedNamePlayer.setId.resolves();

      repeatedNameBadPlayer = testLib.createMockObject(getId, setId);
      repeatedNameBadPlayer.getId.returns(p1Id);
      repeatedNameBadPlayer.setId.rejects();

      playerList.push(repeatedNamePlayer, repeatedNameBadPlayer);
    });
    it('renames the players with repeating names', function () {
      return ensureUniqueNames(playerList).then((uniqueNamedPlayers) => {
        expect(uniqueNamedPlayers.slice(0, 3)).to.deep.eql([gp1, gp2, gp3]);
        expect(uniqueNamedPlayers[3].setId.calledOnce).to.be.true;
        return expect(uniqueNamedPlayers[3].setId.neverCalledWith(p1Id, p2Id, p3Id)).to.be.true;
      })
    });
    it('removes players that do not accept the name change', function () {
      return ensureUniqueNames(playerList).then((uniqueNamedPlayers) => {
        expect(uniqueNamedPlayers.length).to.eql(4);
        expect(uniqueNamedPlayers.slice(0, 3)).to.deep.eql([gp1, gp2, gp3]);
        return expect(uniqueNamedPlayers[3]).to.not.deep.eql(repeatedNameBadPlayer);
      });
    });
  });
  describe('when given players with improperly formed names', function () {
    let disallowedNamePlayer;
    beforeEach(function () {
      disallowedNamePlayer = testLib.createMockObject(getId, setId);
      disallowedNamePlayer.getId.returns('_AbC#4$%');
      disallowedNamePlayer.setId.resolves();

      playerList.push(disallowedNamePlayer);
    });
    it('removes them', function () {
      return expect(ensureUniqueNames(playerList)).to.eventually.deep.eql([gp1, gp2, gp3]);
    });
  });
});