const chai = require('chai');
const sinon = require('sinon');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const assert = chai.assert;
const testLib = require('./test-lib');
const mockPlayer = testLib.mockPlayer;

const TournamentResult = require('../Admin/tournament-result');
const TournamentServer = require('../Remote/server');

const minPlayers = 2, port = 50000, waitingFor = 1000, repeat = false, host = '127.0.0.1', seriesLength = 3;

/* Natural Boolean -> TournamentServer
  Create a TournamentServer with the default values for minPlayers,
  port, host, and seriesLength, but with the given values for
  waitingFor and repeat.
*/
function createTournamentServer(newWaitingFor, newRepeat) {
  return new TournamentServer(minPlayers, port, host,
    newWaitingFor ? newWaitingFor : waitingFor,
    newRepeat ? newRepeat : repeat,
    seriesLength);
}

describe('TournamentServer', function () {
  let ts;
  describe('start', function () {
    let timeoutObj;
    beforeEach(function () {
      timeoutObj = {};
      ts = createTournamentServer();
      ts.server = testLib.createMockObject('listen');
      ts.createTimeout = sinon.stub();
      ts.createTimeout.returns(timeoutObj);
      ts.start();
    });
    it('starts the server listening on the port', function () {
      assert.isTrue(ts.server.listen.calledWith(port, host));
    });
    it('creates the waitingFor timeout and sets it on the object', function () {
      assert.isTrue(ts.createTimeout.called);
      assert.equal(ts.waitingForTimeout, timeoutObj);
    });
  });
  describe('startAndReturnResults', function () {
    let startPromise;
    beforeEach(function () {
      ts = createTournamentServer(1000, false);
      ts.start = sinon.stub();
      startPromise = ts.startAndReturnResults();
    });
    it('calls start() to start the server', function () {
      assert.isTrue(ts.start.calledOnce);
    });
    it('sets the resolution function', function () {
      assert.isNotNull(ts.resolveWithTournamentResult);
    });
    describe('when the resolution function is called with tournament result', function () {
      let tournamentResult;
      beforeEach(function () {
        tournamentResult = new TournamentResult([], [], {});
        ts.resolveWithTournamentResult(tournamentResult);
      });
      it('the original call resolves to those results', function () {
        return assert.becomes(startPromise, tournamentResult);
      });
    });
  });
  describe('createTimeout', function () {
    let waitingFor;
    beforeEach(function () {
      waitingFor = 10;
      ts = createTournamentServer(waitingFor, null);
      ts.shutdown = sinon.stub();
      ts.createTimeout();
    });
    it('creates a timeout that calls shutdown after waitingFor seconds', function () {
      return new Promise((resolve) => {
        return setTimeout(() => {
          assert.isTrue(ts.shutdown.calledOnce);
          resolve();
        }, waitingFor + 1);
      });
    });
  });
  describe('handleConnection', function () {
    let socket, handleConnectionPromise;
    beforeEach(function () {
      ts = createTournamentServer();
      socket = testLib.createMockObject();
    });

    describe('when there are enough registered players', function () {
      beforeEach(function () {
        ts.uniquePlayers = [{}, {}];
        socket.end = sinon.stub();
        handleConnectionPromise = ts.handleConnection(socket);
      });
      it('ends the socket', function () {
        return handleConnectionPromise.then(() => {
          assert.isTrue(socket.end.calledOnce);
        });
      });
    });
    describe('when there are not enough registered players', function () {
      let player;
      beforeEach(function () {
        player = testLib.createMockObject();
        ts.wrapSocket = sinon.stub().resolves({});
        ts.registerPlayer = sinon.stub().resolves(player);
        ts.addAndEnsureUnique = sinon.stub().resolves();
      });
      describe('when the player is registered and added properly', function () {
        beforeEach(function () {
          handleConnectionPromise = ts.handleConnection(socket);
        });
        it('adds the socket to the list', function () {
          return handleConnectionPromise.then(() => {
            assert.isTrue(ts.sockets.includes(socket));
          });
        });
        it('registers the socket as a player', function () {
          return handleConnectionPromise.then(() => {
            assert.isTrue(ts.registerPlayer.calledOnce);
          });
        });
        it('adds the player to the unique player list', function () {
          return handleConnectionPromise.then(() => {
            assert.isTrue(ts.addAndEnsureUnique.calledWith(player));
          });
        });
      });
      describe('when the player fails to be registered', function () {
        beforeEach(function () {
          socket.end = sinon.stub();
          ts.registerPlayer.rejects();
          handleConnectionPromise = ts.handleConnection(socket);
        });
        it('catches the failure and ends the socket', function () {
          return handleConnectionPromise.then(() => {
            assert.isTrue(socket.end.calledOnce);
            assert.isFalse(ts.sockets.includes(socket));
          });
        });
        it('does not attempt to add the player', function () {
          return handleConnectionPromise.then(() => {
            assert.isFalse(ts.addAndEnsureUnique.called);
          });
        });
      });
      describe('when the player fails to be added uniquely', function () {
        beforeEach(function () {
          socket.end = sinon.stub();
          ts.addAndEnsureUnique.rejects();
          handleConnectionPromise = ts.handleConnection(socket);
        });
        it('catches the failure and ends the socket', function () {
          return handleConnectionPromise.then(() => {
            assert.isTrue(socket.end.calledOnce);
            assert.isFalse(ts.sockets.includes(socket));
          });
        });
      });
    });
  });
  describe('createAndRunTournament', function () {
    let mockTM, createAndRunTournamentPromise, tournamentResult;
    beforeEach(function () {
      ts = createTournamentServer();
      mockTM = testLib.createMockObject('startTournament');
      tournamentResult = new TournamentResult([], [], {});
      mockTM.startTournament.resolves(tournamentResult);
      ts.createTournamentManager = sinon.stub().returns(mockTM);
      ts.shutdown = sinon.stub();
    });
    describe('when no resolution function is awaiting the results', function () {
      beforeEach(function () {
        createAndRunTournamentPromise = ts.createAndRunTournament();
      });
      it('creates the tournament manager and starts the tournament', function () {
        return createAndRunTournamentPromise.then(() => {
          assert.isTrue(ts.createTournamentManager.calledOnce);
          assert.isTrue(mockTM.startTournament.calledOnce);
        });
      });
      it('calls shutdown when the tournament is over', function () {
        return createAndRunTournamentPromise.then(() => {
          assert.isTrue(ts.shutdown.calledOnce);
        });
      });
    });
    describe('when there is a resolution function awaiting the results', function () {
      let resolutionFnMock;
      beforeEach(function () {
        resolutionFnMock = sinon.stub();
        ts.resolveWithTournamentResult = resolutionFnMock;
        createAndRunTournamentPromise = ts.createAndRunTournament();
      });
      it('creates the tournament manager and starts the tournament', function () {
        return createAndRunTournamentPromise.then(() => {
          assert.isTrue(ts.createTournamentManager.calledOnce);
          assert.isTrue(mockTM.startTournament.calledOnce);
        });
      });
      it('calls shutdown when the tournament is over', function () {
        return createAndRunTournamentPromise.then(() => {
          assert.isTrue(ts.shutdown.calledOnce);
        });
      });
      it('calls the resolution function with the results', function () {
        return createAndRunTournamentPromise.then(() => {
          return assert.isTrue(resolutionFnMock.calledWith(tournamentResult));
        });
      });
      it('removes the reference to the resolution function', function () {
        return createAndRunTournamentPromise.then(() => {
          return assert.isNull(ts.resolveWithTournamentResult);
        });
      });
    });
  });
  describe('shutdown', function () {
    let socket1, socket2;
    beforeEach(function () {
      socket1 = testLib.createMockObject('end');
      socket2 = testLib.createMockObject('end');
      ts = createTournamentServer();
      ts.server = testLib.createMockObject('close');
      ts.sockets = [socket1, socket2];
    });
    describe('when the tournament is supposed to repeat', function () {
      beforeEach(function () {
        let repeat = true;
        ts.repeat = repeat;
        ts.shutdown();
      });
      it('does not shut down the server', function () {
        assert.isFalse(ts.server.close.called);
      });
      it('closes all sockets', function () {
        assert.isTrue(socket1.end.calledOnce);
        assert.isTrue(socket2.end.calledOnce);
      });
      it('removes all sockets from the list', function () {
        assert.isTrue(ts.sockets.length === 0);
      });
    });
    describe('when the tournament is not supposed to repeat', function () {
      beforeEach(function () {
        let repeat = false;
        ts.repeat = repeat;
        ts.shutdown();
      });
      it('does shut down the server', function () {
        assert.isTrue(ts.server.close.called);
      });
      it('closes all sockets', function () {
        assert.isTrue(socket1.end.calledOnce);
        assert.isTrue(socket2.end.calledOnce);
      });
      it('removes all sockets from the list', function () {
        assert.isTrue(ts.sockets.length === 0);
      });
    });
  });
  describe('registerPlayer', function () {
    beforeEach(function () {
      ts = createTournamentServer();
      ts.getPlayerName = sinon.stub();
    });
    describe('when the socket returns a good value', function () {
      let name, pjs, registerPlayerPromise;
      beforeEach(function () {
        name = 'wayne';
        pjs = {};
        ts.getPlayerName.resolves(name);
        registerPlayerPromise = ts.registerPlayer(pjs);
      });
      it('resolves to a GuardedPlayer that uses that name', function () {
        return registerPlayerPromise.then((gp) => {
          return assert.equal(gp.getId(), name);
        });
      });
    });
    describe('when the socket fails to return a good value', function () {
      let pjs, registerPlayerPromise;
      beforeEach(function () {
        pjs = {};
        ts.getPlayerName.rejects();
        registerPlayerPromise = ts.registerPlayer(pjs);
      });
      it('rejects', function () {
        return assert.isRejected(registerPlayerPromise);
      });
    });
  });
  describe('addAndEnsureUnique', function () {
    let addedPlayer, addedPlayerName, playerToAdd, playerToAddName, addResult;
    beforeEach(function () {
      ts = createTournamentServer();
      ts.createAndRunTournament = sinon.stub();
      addedPlayerName = 'joe';
      addedPlayer = mockPlayer(addedPlayerName);
      ts.uniquePlayers = [addedPlayer];
    });

    describe('when the player is uniquely named', function () {
      beforeEach(function () {
        playerToAddName = 'bob';
        playerToAdd = mockPlayer(playerToAddName);
        ts.canStartTournament = sinon.stub();
        ts.uniquelyNamedPlayer = sinon.stub().resolves(playerToAdd);
      });
      describe('when the tournament can be started', function () {
        beforeEach(function () {
          ts.canStartTournament.returns(true);
          addResult = ts.addAndEnsureUnique(playerToAdd);
        });
        it('starts the tournament', function () {
          return addResult.then(() => {
            return assert.isTrue(ts.createAndRunTournament.calledOnce);
          });
        });
        it('adds the player to the list', function () {
          return addResult.then(() => {
            return assert.isTrue(ts.uniquePlayers.includes(playerToAdd));
          });
        });
      });
      describe('when the tournament cannot be started', function () {
        beforeEach(function () {
          ts.canStartTournament.returns(false);
          addResult = ts.addAndEnsureUnique(playerToAdd);
        });
        it('does not start the tournament', function () {
          return addResult.then(() => {
            return assert.isFalse(ts.createAndRunTournament.called);
          });
        });
        it('adds the player to the list', function () {
          return addResult.then(() => {
            return assert.isTrue(ts.uniquePlayers.includes(playerToAdd));
          });
        });
      });
    });
    describe('when the player fails to be uniquely named', function () {
      beforeEach(function () {
        playerToAddName = 'joe';
        playerToAdd = mockPlayer(playerToAddName);
        ts.uniquelyNamedPlayer = sinon.stub().rejects();
        addResult = ts.addAndEnsureUnique(playerToAdd);
      });
      it('rejects', function () {
        return assert.isRejected(addResult);
      });
    });
  });
  describe('uniquelyNamedPlayer', function () {
    let addedPlayer, addedPlayerName, playerToAdd, playerToAddName, uniqueResult;
    beforeEach(function () {
      ts = createTournamentServer();
      ts.createAndRunTournament = sinon.stub();
      addedPlayerName = 'joe';
      addedPlayer = mockPlayer(addedPlayerName);
      ts.uniquePlayers = [addedPlayer];
    });

    describe('when the player is uniquely-named already', function () {
      beforeEach(function () {
        playerToAddName = 'bob';
        playerToAdd = mockPlayer(playerToAddName);
        uniqueResult = ts.uniquelyNamedPlayer(playerToAdd);
      });
      it('does not set a new name on the player', function () {
        return uniqueResult.then((gp) => {
          assert.deepEqual(gp, playerToAdd);
          return assert.isFalse(gp.setId.called);
        });
      });
    });
    describe('when the player is not uniquely-named', function () {
      beforeEach(function () {
        playerToAddName = 'joe';
        playerToAdd = mockPlayer(playerToAddName);
      });
      describe('when the player accepts a new name', function () {
        beforeEach(function () {
          playerToAdd.setId.resolves();
          uniqueResult = ts.uniquelyNamedPlayer(playerToAdd);
        });
        it('renames the player and resolves', function () {
          return uniqueResult.then((gp) => {
            assert.deepEqual(gp, playerToAdd);
            assert.isTrue(gp.setId.called);
            return assert.isFalse(gp.setId.calledWith(playerToAddName));
          });
        });
      });
      describe('when the player does not accept a new name', function () {
        beforeEach(function () {
          playerToAdd.setId.rejects();
          uniqueResult = ts.uniquelyNamedPlayer(playerToAdd);
        });
        it('rejects', function () {
          return assert.isRejected(uniqueResult);
        });
      });
    });
  });
  describe('canStartTournament', function () {
    beforeEach(function () {
      ts = createTournamentServer();
    });
    describe('when the tournament can be started', function () {
      beforeEach(function () {
        ts.sockets = [{}, {}];
        ts.uniquePlayers = [{}, {}];
      });
      it('returns true', function () {
        assert.isTrue(ts.canStartTournament());
      });
    });
    describe('when not enough unique players have been registered', function () {
      beforeEach(function () {
        ts.sockets = [{}];
        ts.uniquePlayers = [{}];
      });
      it('returns false', function () {
        assert.isFalse(ts.canStartTournament());
      });
    });
    describe('when the server is waiting on sockets to finish registration', function () {
      beforeEach(function () {
        ts.sockets = [{}, {}, {}];
        ts.uniquePlayers = [{}, {}];
      });
      it('returns false', function () {
        assert.isFalse(ts.canStartTournament());
      });
    });
  });
  describe('getPlayerName', function () {
    let pjsMock, name, getPlayerNamePromise;
    beforeEach(function () {
      pjsMock = testLib.createMockObject('readJson');
      ts = createTournamentServer();
    });
    describe('when the PJS provides a good name', function () {
      beforeEach(function () {
        name = 'wayne';
        pjsMock.readJson.resolves(name);
        ts.checkPlayerName = sinon.stub().returns(true);
        getPlayerNamePromise = ts.getPlayerName(pjsMock);
      });
      it('resolves with the name', function () {
        return assert.isFulfilled(getPlayerNamePromise, name);
      });
    });
    describe('when the PJS provides a bad name', function () {
      beforeEach(function () {
        name = 'A_3$';
        pjsMock.readJson.resolves(name);
        ts.checkPlayerName = sinon.stub().returns(false);
        getPlayerNamePromise = ts.getPlayerName(pjsMock);
      });
      it('rejects', function () {
        return assert.isRejected(getPlayerNamePromise);
      });
    });
    describe('when the PJS does not provide a name', function () {
      beforeEach(function () {
        pjsMock.readJson.rejects();
        ts.checkPlayerName = sinon.stub().returns(false);
        getPlayerNamePromise = ts.getPlayerName(pjsMock);
      });
      it('rejects', function () {
        return assert.isRejected(getPlayerNamePromise);
      });
    });
  });
  describe('checkPlayerName', function () {
    beforeEach(function () {
      ts = createTournamentServer();
    });
    it('returns false for non-string values', function () {
      assert.isFalse(ts.checkPlayerName([]));
    });
    it('returns false for names with uppercase letters', function () {
      assert.isFalse(ts.checkPlayerName("A"));
    });
    it('returns false for names with special characters', function () {
      assert.isFalse(ts.checkPlayerName("%"));
    });
    it('returns false for names with numerals', function () {
      assert.isFalse(ts.checkPlayerName("abc1"));
    });
    it('returns true for lowercase, alphabetic names', function () {
      assert.isTrue(ts.checkPlayerName("wayne"));
    });
  });
});