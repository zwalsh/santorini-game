const chai = require('chai');
const assert = chai.assert;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const sinon = require('sinon');
const testLib = require('./test-lib');

const Board = require('../Common/board');
const Direction = require('../Common/direction');
const RemoteProxyReferee = require('../Remote/remote-proxy-referee');

describe('RemoteProxyReferee tests', function () {
  let rpr;
  describe('startSeries', function () {
    let player, socket, opponentName, serverMsg, unrecognizedMsg, startGamePromise;
    beforeEach(function () {
      player = testLib.mockPlayer('pam');
      player.newGame = sinon.stub().resolves();

      socket = testLib.createMockObject('readJson');
      serverMsg = [];
      socket.readJson.resolves(serverMsg);

      rpr = new RemoteProxyReferee(player, socket);
      unrecognizedMsg = [["a", "b"]];
      rpr.handleGameMessage = sinon.stub().resolves(unrecognizedMsg);

      opponentName = 'jim';
      startGamePromise = rpr.startSeries(opponentName);
    });
    it('calls newGame on the player', function () {
      return startGamePromise.then(() => {
        return assert.isTrue(player.newGame.calledWith(opponentName));
      });
    });
    it('reads the next JSON value and sends it to handleGameMessage', function () {
      return startGamePromise.then(() => {
        return assert.isTrue(rpr.handleGameMessage.calledWith(serverMsg));
      });
    });
    it('resolves to the value received from handleGameMessage', function () {
      return assert.becomes(startGamePromise, unrecognizedMsg);
    });
  });

  describe('handleGameMessage', function () {
    let handleGameMessagePromise;
    beforeEach(function () {
      rpr = new RemoteProxyReferee({}, {});
    });
    describe('when given a Placement message', function () {
      let placementMsg, nextServerMsg;
      beforeEach(function () {
        placementMsg = [['grape1', 0, 0]];
        nextServerMsg = 'meredith';

        rpr.handlePlacement = sinon.stub().resolves(nextServerMsg);
        handleGameMessagePromise = rpr.handleGameMessage(placementMsg);
      });
      it('passes the message to handlePlacement',  function () {
        return handleGameMessagePromise.then(() => {
          return assert.isTrue(rpr.handlePlacement.calledWith(placementMsg));
        });
      });
      it('resolves to the first non-game message encountered', function () {
        return assert.becomes(handleGameMessagePromise, nextServerMsg);
      });
    });

    describe('when given a Board message', function () {
      let boardMsg, nextServerMsg;
      beforeEach(function () {
        boardMsg = [['0a1', '0a2', '0b1', '0b2', 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0]];
        nextServerMsg = 'meredith';

        rpr.handleTakeTurn = sinon.stub().resolves(nextServerMsg);
        handleGameMessagePromise = rpr.handleGameMessage(boardMsg);
      });
      it('passes the message to handleTakeTurn',  function () {
        return handleGameMessagePromise.then(() => {
          return assert.isTrue(rpr.handleTakeTurn.calledWith(boardMsg));
        });
      });
      it('resolves to the first non-game message encountered', function () {
        return assert.becomes(handleGameMessagePromise, nextServerMsg);
      });
    });

    describe('when given an unrecognized message', function () {
      let unrecognizedMsg;
      beforeEach(function () {
        unrecognizedMsg = 'mango';
        handleGameMessagePromise = rpr.handleGameMessage(unrecognizedMsg);
      });
      it('resolves to that value',  function () {
        return assert.becomes(handleGameMessagePromise, unrecognizedMsg);
      });
    });
  });

  describe('handlePlacement', function () {
    let player, socket, placementMsg, expectedInitWorkers, placeRequest,
      expectedPlace, nextServerMsg, handlePlacementPromise;
    beforeEach(function () {
      let playerName = 'mango';
      placementMsg = [['grape1', 0, 0]];
      expectedInitWorkers = [{player: 'grape', x: 0, y: 0}];
      placeRequest = ['place', 1, 1];
      expectedPlace = [1, 1];
      nextServerMsg = [['grape1', 0, 0], ['mango1', 1, 1], ['grape2', 2, 2]];

      player = testLib.mockPlayer(playerName);
      player.placeInitialWorker = sinon.stub().resolves(placeRequest);

      socket = testLib.createMockObject('readJson', 'sendJson');
      socket.readJson.resolves(nextServerMsg);

      rpr = new RemoteProxyReferee(player, socket);
      handlePlacementPromise = rpr.handlePlacement(placementMsg);
    });
    it('call placeInitialWorker on the player with the converted Placement', function () {
      return handlePlacementPromise.then(() => {
        return assert.isTrue(player.placeInitialWorker.calledWith(expectedInitWorkers));
      });
    });
    it('sends the translated player response back to the server', function () {
      return handlePlacementPromise.then(() => {
        let actualWorkerPlace = socket.sendJson.getCall(0).args[0];
        return assert.deepEqual(actualWorkerPlace, expectedPlace);
      });
    });
    it('resolve to the next value received from the server', function () {
      return assert.becomes(handlePlacementPromise, nextServerMsg);
    });
  });

  describe('handleTakeTurn', function () {
    let player, socket, boardMsg, expectedBoard, turn,
      expectedAction, nextServerMsg, handleTakeTurnPromise;
    beforeEach(function () {
      boardMsg = [['0mango1', '0mango2', '0grape1', '0grape2', 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0]];
      let initWorkers = [{player: 'mango', x: 0, y: 0 },
        {player: 'mango', x: 1, y: 0 },
        {player: 'grape', x: 2, y: 0 },
        {player: 'grape', x: 3, y: 0 }];
      expectedBoard = new Board(initWorkers);

      turn = [['move', {player: 'mango', id: 2}, [Direction.WEST, Direction.SOUTH]],
        ['build', [Direction.EAST, Direction.SOUTH]]];
      expectedAction = ['mango2', Direction.WEST, Direction.SOUTH, Direction.EAST, Direction.SOUTH];

      nextServerMsg = 'banana';

      player = testLib.createMockObject('takeTurn');
      player.takeTurn.resolves(turn);

      socket = testLib.createMockObject('readJson', 'sendJson');
      socket.readJson.resolves(nextServerMsg);

      rpr = new RemoteProxyReferee(player, socket);
      handleTakeTurnPromise = rpr.handleTakeTurn(boardMsg);
    });

    it('calls takeTurn on the player with the converted Board', function () {
      return handleTakeTurnPromise.then(() => {
        return assert.isTrue(player.takeTurn.calledWith(expectedBoard));
      });
    });
    it('sends the translated player response back to the server', function () {
      return handleTakeTurnPromise.then(() => {
        return assert.isTrue(socket.sendJson.calledWith(expectedAction));
      });
    });
    it('resolve to the next value received from the server', function () {
      return assert.becomes(handleTakeTurnPromise, nextServerMsg);
    });
  });
});






