const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');
const testLib = require('./test-lib');

const SantoriniClient = require('../Remote/client');

describe('SantoriniClient tests', function () {
  let player, socket, client;
  beforeEach(function () {
    player = {};
    socket = {};
    client = new SantoriniClient(player, socket);
  });
  describe('start', function () {
    describe('when the tournament execution succeeds', function () {
      let startPromise;
      beforeEach(function () {
        let mockTM = testLib.createMockObject('startTournament');
        mockTM.startTournament.resolves();
        client.createTournament = sinon.stub().returns(mockTM);
        client.shutdown = sinon.stub();
        startPromise = client.start();
      });

      it('creates the tournament', function () {
        return startPromise.then(() => {
          return assert.isTrue(client.createTournament.called);
        });
      });
      it('after the tournament is over, calls shutdown()', function () {
        return startPromise.then(() => {
          return assert.isTrue(client.shutdown.called);
        });
      });
    });

    describe('when the tournament execution fails', function () {
      let startPromise;
      beforeEach(function () {
        let mockTM = testLib.createMockObject('startTournament');
        mockTM.startTournament.rejects();
        client.createTournament = sinon.stub().returns(mockTM);
        client.shutdown = sinon.stub();
        startPromise = client.start();
      });

      it('creates the tournament', function () {
        return startPromise.then(() => {
          return assert.isTrue(client.createTournament.called);
        });
      });
      it('after the tournament is over, calls shutdown()', function () {
        return startPromise.then(() => {
          return assert.isTrue(client.shutdown.called);
        });
      });
    });
    });
  });

  describe('shutdown', function () {
    let mockSock;
    beforeEach(function () {
      mockSock = testLib.createMockObject('destroy');
      client.socket = mockSock;
    });
    it('closes the socket', function () {
      assert.isTrue(mockSock.destroy.called);
    });
  });
});



