const chai = require('chai');
const assert = chai.assert;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const sinon = require('sinon');
const testLib = require('./test-lib');
const constants = require('../Common/constants');

const GameResult = require('../Common/game-result');
const RemoteProxyTournamentManager = require('../Remote/remote-proxy-tournament-manager');

describe('RemoteProxyTournamentManager tests', function () {
  let rptm;
  describe('start', function () {
    let msg, encounterOutcomes, startPromise;
    beforeEach(function () {
      rptm = new RemoteProxyTournamentManager({}, {});
      msg = 'wayne';
      rptm.register = sinon.stub().resolves(msg);
      encounterOutcomes = [];
      rptm.handleTournamentMessage = sinon.stub().resolves(encounterOutcomes);
      rptm.notifyPlayerOfEnd = sinon.stub().resolves();

      startPromise = rptm.start();
    });
    it('registers the player, runs the tournament, and notifies player of end', function () {
      return startPromise.then(() => {
        assert.isTrue(rptm.register.calledOnce);
        assert.isTrue(rptm.handleTournamentMessage.calledWith(msg));
        return assert.isTrue(rptm.notifyPlayerOfEnd.calledWith(encounterOutcomes));
      });
    });
  });

  describe('register', function () {
    let mockSocket, mockPlayer, name, registerPromise;
    beforeEach(function () {
      mockSocket = testLib.createMockObject('sendJson', 'readJson');
      name = 'kelly';
      mockPlayer = testLib.mockPlayer(name);
      mockPlayer.setId.resolves();
    });

    describe('when the player is already uniquely named', function () {
      let opponentName;
      beforeEach(function () {
        opponentName = 'ryan';
        mockSocket.readJson.resolves(opponentName);

        rptm = new RemoteProxyTournamentManager(mockPlayer, mockSocket);
        registerPromise = rptm.register();
      });

      it('sends the player name to the server', function () {
        return registerPromise.then(() => {
          return assert.isTrue(mockSocket.sendJson.calledWith(name));
        });
      });
      it('returns the following server message', function () {
        return registerPromise.then((result) => {
          assert.deepEqual(result, opponentName);
          return assert.isTrue(mockSocket.readJson.calledOnce);
        })
      });
    });

    describe('when the server renames the player', function () {
      let opponentName, newName;
      beforeEach(function () {
        opponentName = 'ryan';
        newName = 'kellyy';
        mockSocket.readJson
          .onCall(0).resolves([constants.Message.PLAYING_AS, newName])
          .onCall(1).resolves(opponentName);

        rptm = new RemoteProxyTournamentManager(mockPlayer, mockSocket);
        registerPromise = rptm.register();
      });
      it('sends the player name to the server', function () {
        return registerPromise.then(() => {
          return assert.isTrue(mockSocket.sendJson.calledWith(name));
        });
      });
      it('sets the new name on the player', function () {
        return registerPromise.then(() => {
          return assert.isTrue(mockPlayer.setId.calledWith(newName));
        });
      });
      it('returns the following server message', function () {
        return assert.becomes(registerPromise, opponentName);
      });
    });
  });

  describe('handleTournamentMessage', function () {
    let handleTMPromise;
    beforeEach(function () {
      rptm = new RemoteProxyTournamentManager({}, {});
    });
    describe('when given an opponent name', function () {
      let name, encounterOutcomes;
      beforeEach(function () {
        name = 'phyllis';
        encounterOutcomes = [];
        rptm.playNextGame = sinon.stub().resolves(encounterOutcomes);
        handleTMPromise = rptm.handleTournamentMessage(name);
      });
      it('starts the next game', function () {
        return handleTMPromise.then(() => {
          return assert.isTrue(rptm.playNextGame.calledWith(name));
        });
      });
      it('resolves with the next');
    });

    describe('when given the tournament results', function () {
      let encounterOutcomes;
      beforeEach(function () {
        encounterOutcomes = [["a", "b"]];
        handleTMPromise = rptm.handleTournamentMessage(encounterOutcomes);
      });
      it('resolves with the results', function () {
        return assert.becomes(handleTMPromise, encounterOutcomes);
      });
    });

    describe('when given an unexpected value', function () {
      beforeEach(function () {
        rptm.player.getId = sinon.stub().returns('dontcare');
        handleTMPromise = rptm.handleTournamentMessage('unexpected value');
      });
      it('rejects', function () {
        return assert.isRejected(handleTMPromise);
      });
    });
  });

  describe('playNextGame', function () {
    let mockRef, refResult, opponentName, playNextGamePromise;
    beforeEach(function () {
      rptm = new RemoteProxyTournamentManager({}, {});
      opponentName = 'oppt';
      refResult = 'newopponent';

      mockRef = testLib.createMockObject('startGame');
      mockRef.startGame.resolves(refResult);
      rptm.createReferee = sinon.stub().returns(mockRef);

      playNextGamePromise = rptm.playNextGame(opponentName);
    });

    it('creates a referee', function () {
      return playNextGamePromise.then(() => {
        return assert.isTrue(rptm.createReferee.calledOnce);
      });
    });
    it('starts a game against the given opponent', function () {
      return playNextGamePromise.then(() => {
        return assert.isTrue(mockRef.startGame.calledWith(opponentName));
      });
    });
    it('resolves with the message returned by the referee after the game', function () {
      return assert.becomes(playNextGamePromise, refResult);
    });
  });

  describe('notifyPlayerOfEnd', function () {
    let mockPlayer, encounterOutcomes, expectedGameResults, notifyPromise;
    beforeEach(function () {
      mockPlayer = testLib.mockPlayer('dontcare');
      mockPlayer.notifyTournamentOver = sinon.stub().resolves();
      encounterOutcomes = [["a", "b"], ["c", "d", "irregular"]];
      expectedGameResults = [new GameResult("a", "b", constants.EndGameReason.WON),
        new GameResult("c", "d", constants.EndGameReason.BROKEN_RULE)];

      rptm = new RemoteProxyTournamentManager(mockPlayer, {});
      notifyPromise = rptm.notifyPlayerOfEnd(encounterOutcomes)
    });

    it('converts the EncounterOutcomes to GameResults and sends them to player', function () {
      return notifyPromise.then(() => {
        let actualGameResults = mockPlayer.notifyTournamentOver.getCall(0).args[0];
        return assert.deepEqual(actualGameResults, expectedGameResults);
      });
    });
  });
});


