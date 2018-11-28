const chai = require('chai');
const assert = chai.assert;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const testLib = require('./test-lib');

const Direction = require('../Common/direction');
const GameResult = require('../Common/game-result');
const Board = require('../Common/board');
const constants = require('../Common/constants');
const RemoteProxyPlayer = require('../Remote/remote-proxy-player');

describe('RemoteProxyPlayer tests', function () {
  let rpp, mockPJSocket, name, opponentName;
  beforeEach(function () {
    name = 'butt';
    mockPJSocket = testLib.createMockObject('readJson', 'sendJson');
    rpp = new RemoteProxyPlayer(mockPJSocket, name);
  });
  
  describe('setId', function () {
    let newName, setIdResult;
    beforeEach(function () {
      mockPJSocket.sendJson.resolves();
      newName = 'ttub';
      setIdResult = rpp.setId(newName);
    });
    it('changes the name on the RPP', function () {
      return setIdResult.then(() => {
        return assert.equal(rpp.name, newName);
      });
    });
    it('sends the new name to the client', function () {
      return setIdResult.then(() => {
        let nameFromCall = mockPJSocket.sendJson.getCall(0).args[0];
        return assert.deepEqual(nameFromCall, ['playing-as', newName]);
      });
    });
    it('resolves to indicate that the name was sent', function () {
      return assert.isFulfilled(setIdResult);
    });
  });
  
  describe('placeInitialWorker', function () {
    let initWorkerList, expectedPlaceReq, expectedPlacement, actualPlaceReq;
    beforeEach(function () {
      name = 'garth';
      opponentName = 'wayne';
      initWorkerList = [{ player: name, x: 1, y: 1 },
        { player: opponentName, x: 2, y: 2 },
        { player: name, x: 3, y: 3 }];
      expectedPlacement = [[name + 1, 1, 1], [opponentName + 1, 2, 2],
        [name + 2, 3, 3]];
      expectedPlaceReq = ["place", 4, 4];

      let placeMsg = [4, 4];
      mockPJSocket.readJson.resolves(placeMsg);

      actualPlaceReq = rpp.placeInitialWorker(initWorkerList);
    });
    // note to future selves: if these fail, try grabbing the call arg to deepEqual check
    it('sends the correct Placement to the client', function () {
      return actualPlaceReq.then(() => {
        return assert.isTrue(mockPJSocket.sendJson.calledWith(expectedPlacement));
      });
    });
    it('asks the client for a response', function () {
      return actualPlaceReq.then(() => {
        return assert.isTrue(mockPJSocket.sendJson.calledWith(expectedPlacement));
      });
    });
    it('converts the response to a PlaceRequest and returns it', function () {
      return assert.becomes(actualPlaceReq, expectedPlaceReq);
    });
  });

  describe('takeTurn', function () {
    let heights, board, jsonBoard, expectedTurn, actualTurn;
    beforeEach(function () {
      name = 'alfred';
      opponentName = 'sampson';
      heights = [[0, 1, 2, 3, 2, 1],
        [1, 1, 1, 1, 1, 1],
        [3, 3, 3, 3, 3, 3],
        [4, 3, 2, 1, 0, 0],
        [3, 4, 2, 3, 1, 2],
        [1, 0, 0, 0, 0, 1]];
      let initWorkers = [
        {player:name, x:4, y:5},
        {player:opponentName, x:5, y:5},
        {player:name, x:3, y:1},
        {player:opponentName, x:3, y:3}];
      board = new Board(initWorkers, heights);

      jsonBoard = [[0, 1, 2, 3, 2, 1],
        [1, 1, 1, "1alfred2", 1, 1],
        [3, 3, 3, 3, 3, 3],
        [4, 3, 2, "1sampson2", 0, 0],
        [3, 4, 2, 3, 1, 2],
        [1, 0, 0, 0, "0alfred1", "1sampson1"]];

      expectedTurn = [["move", {player: name, id: 1}, [Direction.WEST, Direction.PUT]],
        ["build", [Direction.PUT, Direction.NORTH]]];

      let resultingAction = [name+1, Direction.WEST, Direction.PUT, Direction.PUT, Direction.NORTH];
      mockPJSocket.readJson.resolves(resultingAction);

      actualTurn = rpp.takeTurn(board);
    });
    it('sends the correct Board to the client', function () {
      return actualTurn.then(() => {
        let boardFromCall = mockPJSocket.sendJson.getCall(0).args[0];
        return assert.deepEqual(boardFromCall, jsonBoard);
      });
    });
    it('asks the client for a response', function () {
      return actualTurn.then(() => {
        return assert.isTrue(mockPJSocket.readJson.calledOnce);
      });
    });
    it('converts the response to a Turn and returns it', function () {
      return assert.becomes(actualTurn, expectedTurn);
    });
  });

  describe('newGame', function () {
    let newGameResult;
    beforeEach(function () {
      opponentName = 'ocks';
      newGameResult = rpp.newGame(opponentName);
    });
    it('sends the opponent\'s name to the client', function () {
      return newGameResult.then(() => {
        return assert.isTrue(mockPJSocket.sendJson.calledWith(opponentName));
      });
    });
    it('resolves to indicate that the name was sent', function () {
      return assert.isFulfilled(newGameResult);
    })
    describe('when playing another game against the same opponent', function () {
      let nextNewGameResult;
      beforeEach(function () {
        nextNewGameResult = newGameResult.then(() => {
          return rpp.newGame(opponentName);
        });
      });
      it('does not send the name again', function () {
        return nextNewGameResult.then(() => {
          return assert.isTrue(mockPJSocket.sendJson.calledOnce);
        });
      });
    });
    describe('when playing a new game against a new opponent', function () {
      let nextOpponent, nextNewGameResult;
      beforeEach(function () {
        nextOpponent = 'blah';
        nextNewGameResult = newGameResult.then(() => {
          return rpp.newGame(nextOpponent);
        });
      });
      it('sends the new name', function () {
        return nextNewGameResult.then(() => {
          return assert.isTrue(mockPJSocket.sendJson.calledWith(nextOpponent));
        });
      });
    });
  });

  describe('notifyTournamentOver', function () {
    let gameResultList, encounterOutcomeList, otherOpponentName, callResult;
    beforeEach(function () {
      name = 'garth';
      opponentName = 'wayne';
      otherOpponentName = 'baberahamlincoln';
      encounterOutcomeList = [[name, opponentName], [opponentName, name],
        [opponentName, otherOpponentName, 'irregular']];
      gameResultList = [
        new GameResult(name, opponentName, constants.EndGameReason.WON),
        new GameResult(opponentName, name, constants.EndGameReason.WON),
        new GameResult(opponentName, otherOpponentName, constants.EndGameReason.BROKEN_RULE),
      ];
      callResult = rpp.notifyTournamentOver(gameResultList);
    });
    it('sends the correct list of EncounterOutcomes to the client', function () {
      return callResult.then(() => {
        let eoListFromCall = mockPJSocket.sendJson.getCall(0).args[0];
        return assert.deepEqual(eoListFromCall, encounterOutcomeList);
      });
    });
    it('resolves to indicate that the results were sent', function () {
      return assert.isFulfilled(callResult);
    });
  });
});

