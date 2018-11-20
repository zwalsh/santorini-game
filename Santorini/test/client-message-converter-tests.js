const chai = require('chai');
const assert = chai.assert;

const Board = require('../Common/board');
const GameResult = require('../Common/game-result');
const constants = require('../Common/constants');

const MC = require('../Remote/client-message-converter');

describe('MessageConverter tests', function () {
  // ["place", x:int, y:int] -> [Coordinate, Coordinate]
  describe('placeRequestToJson', function () {
    let placeReq, expectedPlace;
    beforeEach(function () {
      placeReq = ["place", 2, 4];
      expectedPlace = [2, 4];
    });

    it('produces the expected Place data', function () {
      let place = MC.placeRequestToJson(placeReq);
      assert.deepEqual(place, expectedPlace);
    });
  });

  describe('turnToJson', function () {
    let move, build, pName, workerId;
    beforeEach(function () {
      pName = 'garth';
      workerId = 1;
      move = ["move", {player: pName, id: workerId}, ["EAST", "NORTH"]];
      build = ["build", ["WEST", "SOUTH"]];
    });

    it('converts the Worker correctly', function () {
      let turn = [move, build];
      assert.deepEqual(MC.turnToJson(turn)[0], 'garth1');
    });
    it('converts a Move-only turn correctly', function () {
      let turn = [move];
      assert.deepEqual(MC.turnToJson(turn), ['garth1', "EAST", "NORTH"]);
    });
    it('converts a Move-Build turn correctly', function () {
      let turn = [move, build];
      assert.deepEqual(MC.turnToJson(turn), ['garth1', "EAST", "NORTH", "WEST", "SOUTH"]);
    });
  });

  // [[Worker,Coordinate,Coordinate], ...]
  //       -> [{player: string, x: int, y: int}, ...]
  describe('jsonToInitWorkerList', function () {
    let placement, expectedInitWorkerList;
    beforeEach(function () {
      let workerPlace1 = ['garth1', 0, 0];
      let workerPlace2 = ['wayne1', 1, 1];
      placement = [workerPlace1, workerPlace2];
      expectedInitWorkerList = [{player:'garth', x:0, y:0},
        {player:'wayne', x:1, y:1}];
    });

    it('produces the expected list of InitWorkers', function () {
      let initWorkerList = MC.jsonToInitWorkerList(placement);
      assert.deepEqual(initWorkerList, expectedInitWorkerList);
    });
  });

  describe('jsonToBoard', function () {
    let jsonBoard, heights, expectedBoard, actualBoard;
    beforeEach(function () {
      heights = [[0, 1, 2, 3, 2, 1],
        [1, 1, 1, 1, 1, 1],
        [3, 3, 3, 3, 3, 3],
        [4, 3, 2, 1, 0, 0],
        [3, 4, 2, 3, 1, 2],
        [1, 0, 0, 0, 0, 1]];
      let initWorkers = [
        {player:"alfred", x:4, y:5},
        {player:"sampson", x:5, y:5},
        {player:"alfred", x:3, y:1},
        {player:"sampson", x:3, y:3}];
      expectedBoard = new Board(initWorkers, heights);

      jsonBoard = [[0, 1, 2, 3, 2, 1],
        [1, 1, 1, "1alfred2", 1, 1],
        [3, 3, 3, 3, 3, 3],
        [4, 3, 2, "1sampson2", 0, 0],
        [3, 4, 2, 3, 1, 2],
        [1, 0, 0, 0, "0alfred1", "1sampson1"]];
      actualBoard = MC.jsonToBoard(jsonBoard);
    });
    it('creates a board with the expected workers', function () {
      let expectedWorkers = expectedBoard.getWorkers();
      let actualWorkers = actualBoard.getWorkers();
      assert.equal(expectedWorkers.length, actualWorkers.length);

      for (let i = 0; i < expectedWorkers.length; i++) {
        let expectedWorker = expectedWorkers[i];
        let workerExistsInResult = actualWorkers.some(worker => {
          return worker.player === expectedWorker.player &&
            worker.id === expectedWorker.id &&
            worker.posn.x === expectedWorker.posn.x &&
            worker.posn.y === expectedWorker.posn.y;
        });
        assert.isTrue(workerExistsInResult);
      }
    });
    it('creates a board with the correct heights', function () {
      assert.deepEqual(actualBoard.board, expectedBoard.board);
    });
  });

  // [EncounterOutcome] -> [GameResult, ...]
  describe('jsonToGameResults', function () {
    let encounterOutcomes, expectedGameResults, p1Name, p2Name, p3Name;
    beforeEach(function () {
      p1Name = 'garth';
      p2Name = 'wayne';
      p3Name = 'baberahamlincoln';
      encounterOutcomes = [[p1Name, p2Name], [p2Name, p1Name],
        [p2Name, p3Name, 'irregular']];
      expectedGameResults = [
        new GameResult(p1Name, p2Name, constants.EndGameReason.WON),
        new GameResult(p2Name, p1Name, constants.EndGameReason.WON),
        new GameResult(p2Name, p3Name, constants.EndGameReason.BROKEN_RULE),
      ];
    });
    it('produces the expected GameResults', function () {
      let actualGameResults = MC.jsonToGameResults(encounterOutcomes);
      assert.deepEqual(actualGameResults, expectedGameResults);
    });
  });
});