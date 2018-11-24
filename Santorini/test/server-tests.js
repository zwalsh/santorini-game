const chai = require('chai');
const sinon = require('sinon');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const assert = chai.assert;
const testLib = require('./test-lib');

const TournamentServer = require('../Remote/server');

/* String -> Player
  Create mock Player object with getId() and setId() mocked.
  getId() returns name. No other methods mocked.
*/
function mockPlayer(name) {
  let player = testLib.createMockObject('getId', 'setId');
  player.getId.returns(name);
  return player;
}

describe('TournamentServer', function () {
  let ts, minPlayers, port, waitingFor, repeat, host;
  beforeEach(function () {
    minPlayers = 2;
    port = 50000;
    waitingFor = 1000;
    repeat = 0;
    host = '127.0.0.1';
  });
  describe('start', function () {
    let timeoutObj;
    beforeEach(function () {
      timeoutObj = {};
      ts = new TournamentServer(minPlayers, port, waitingFor, repeat);
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
  describe('createTimeout', function () {
    beforeEach(function () {
      waitingFor = 10;
      ts = new TournamentServer(minPlayers, port, waitingFor, repeat, host);
      ts.shutdown = sinon.stub();
      ts.createTimeout();
    });
    it('creates a timeout that calls shutdown after waitingFor seconds', function () {
      return new Promise(() => {
        return setTimeout(() => {
          return assert.isTrue(ts.shutdown.calledOnce);
        }, waitingFor + 1);
      });
    });
  });
  describe('handleConnection', function () {
    let socket;
    beforeEach(function () {
      ts = new TournamentServer(minPlayers, port, waitingFor, repeat);
      ts.createAndRunTournament = sinon.stub();
      socket = testLib.createMockObject();
    });
    describe('when more than one player is needed to start a tournament', function () {
      beforeEach(function () {
        ts.handleConnection(socket);
      });
      it('adds the socket to the list', function () {
        assert.deepEqual(ts.sockets, [socket]);
      });
      it('does not start the tournament', function () {
        assert.isFalse(ts.createAndRunTournament.called);
      });
    });
    describe('when one more player is needed to start a tournament', function () {
      beforeEach(function () {
        ts.sockets = [{}];
        ts.handleConnection(socket);
      });
      it('adds the socket to the list', function () {
        assert.deepEqual(ts.sockets, [{}, socket]);
      });
      it('starts the tournament', function () {
        assert.isTrue(ts.createAndRunTournament.calledOnce);
      });
    });
    describe('when the server already has enough connections', function () {
      beforeEach(function () {
        ts.sockets = [{}, {}];
        socket = testLib.createMockObject('destroy');
        ts.handleConnection(socket);
      });
      it('destroys the incoming connection', function () {
        assert.isTrue(socket.destroy.calledOnce);
      });
      it('does not add the connection to the list', function () {
        assert.deepEqual(ts.sockets, [{}, {}]);
      });
      it('does not start the tournament', function () {
        assert.isFalse(ts.createAndRunTournament.isCalled);
      });
    });
  });
  describe('createAndRunTournament', function () {
    beforeEach(function () {
      ts = new TournamentServer(minPlayers, port, waitingFor, repeat);
    });
    describe('when not enough players can be registered (fail to provide name)', function () {
      let promiseResult;
      beforeEach(function () {
        ts.sockets = [{}, {}];
        ts.createPlayerWithSocket = sinon.stub.rejects();
        ts.createTournamentManager = sinon.stub();
        ts.shutdown = sinon.stub();
        promiseResult = ts.createAndRunTournament();
      });
      it('does not create the tournament manager', function () {
        return promiseResult.then(() => {
          return assert.isFalse(ts.createTournamentManager.called);
        });
      });
      it('calls shutdown', function () {
        return promiseResult.then(() => {
          return assert.isTrue(ts.shutdown.called);
        });
      });
    });
    describe('when players fail to provide names', function () {
      // 3 sockets, but only 2 calls to createPlayer succeed.
      let p1, p2, mockTM, promiseResult;
      beforeEach(function () {
        ts.sockets = [{}, {}, {}];
        p1 = mockPlayer("a");
        p2 = mockPlayer("b");
        ts.createPlayerWithSocket = sinon.stub
          .onCall(0).resolves(p1)
          .onCall(1).rejects()
          .onCall(2).resolves(p2);

        mockTM = testLib.createMockObject('startTournament');
        mockTM.startTournament.resolves();
        ts.createTournamentManager = sinon.stub().resolves(mockTM);
        ts.shutdown = sinon.stub();

        promiseResult = ts.createAndRunTournament();
      });
      it('excludes those players from the tournament', function () {
        return promiseResult.then(() => {
          return assert.isTrue(ts.createTournamentManager.calledWith([p1, p2]));
        });
      });
    });
    describe('when enough players are properly set up', function () {
      let p1, p2, p3, mockTM, promiseResult;
      beforeEach(function () {
        ts.sockets = [{}, {}, {}];
        p1 = mockPlayer("a");
        p2 = mockPlayer("b");
        p3 = mockPlayer("c");
        ts.createPlayerWithSocket = sinon.stub
          .onCall(0).resolves(p1)
          .onCall(1).resolves(p2)
          .onCall(2).resolves(p3);

        mockTM = testLib.createMockObject('startTournament');
        mockTM.startTournament.resolves();
        ts.createTournamentManager = sinon.stub().resolves(mockTM);
        ts.shutdown = sinon.stub();

        promiseResult = ts.createAndRunTournament();
      });
      it('makes the TournamentManager with all ready players', function () {
        return promiseResult.then(() => {
          assert.isTrue(ts.createTournamentManager.calledWith([p1, p2, p3]));
          assert.isTrue(mockTM.startTournament.calledOnce);
          return;
        });
      });
      it('wraps all sockets in RemoteProxyPlayers and GuardedPlayers', function () {
        return promiseResult.then(() => {
          return assert.equal(ts.createPlayerWithSocket.callCount, 3);
        });
      });
      it('clears the waitingForTimeout', function () {
        return promiseResult.then(() => {
          return assert.isNull(ts.waitingForTimeout);
        });
      });
      it('calls shutdown when the tournament ends', function () {
        return promiseResult.then(() => {
          return assert.isTrue(ts.shutdown.called);
        });
      });
    });
  });
  describe('createTournamentManager', function () {
    beforeEach(function () {
      // will need to mock player objects w getId, setId
    });
    describe('when not enough players accept unique names', function () {
      // getId should return same id, setId should reject
      it('does not create the TournamentManager', function () {

      });
    });
    describe('when enough players have or accept unique names', function () {
      // getId should return same id
      it('creates the TournamentManager with the players that accepted names', function () {

      });
    });
  });
  describe('shutdown', function () {
    it('closes all sockets');
    it('removes all sockets from the list');
    describe('when the tournament is supposed to repeat', function () {
      it('does not shut down the server');
    });
    describe('when the tournament is not supposed to repeat', function () {
      it('shuts down the server');
    });
  });
  describe('createPlayerWithSocket', function () {
    it('gets the player\'s name', function () {

    });
    it('returns a GuardedPlayer with a RemoteProxyPlayer');
  });
  describe('getPlayerName', function () {
    describe('when the PJS provides a name', function () {
      it('resolves with the name');
    });
    describe('when the PJS does not provide a name', function () {
      it('rejects');
    });
  });
});