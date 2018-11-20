const chai = require('chai');
const assert = chai.assert;

const Direction = require('../Common/direction');
const Board = require('../Common/board');
const GameResult = require('../Common/game-result');
const Worker = require('../Common/worker');

const MC = require('../Remote/server-message-converter');

const constants = require('../Common/constants');
const WON = constants.EndGameReason.WON;
const BROKEN_RULE = constants.EndGameReason.BROKEN_RULE;

describe('ServerMessageConverter tests', function () {
  let p1 = 'crosby', p2 = 'stills', p3 = 'nash';
  describe('initWorkerListToJson', function () {
    let initWorkerList = [{ player: p1, x: 1, y: 1 },
      { player: p2, x: 2, y: 2 },
      { player: p1, x: 3, y: 3 }];
    it('translates each InitWorker in the list into a WorkerPlace', function () {
      let expectedPlacement = [[p1 + 1, 1, 1], [p2 + 1, 2, 2], [p1 + 2, 3, 3]];
      assert.deepEqual(MC.initWorkerListToJson(initWorkerList), expectedPlacement);
    });
  });
  describe('boardToJson', function () {
    let board, initBoard, jsonBoard, playerName1, playerName2, workerLocations;
    beforeEach(function () {
      playerName1 = "wayne";
      playerName2 = "garth";
      initBoard = [[2, 0, 3, 4, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0],
        [0, 0, 0, 2, 0, 0],
        [0, 2, 0, 0, 0, 0]];
      board = new Board(null,
        initBoard,
        [new Worker(0, 0, 1, playerName1),
          new Worker(1, 0, 1, playerName2),
          new Worker(2, 3, 2, playerName1)]);
      workerLocations = [[0, 0], [1, 0], [2, 3]];
      jsonBoard = MC.boardToJson(board);
    });
    it('includes all workers (with heights) in the output', function () {
      assert.deepEqual(jsonBoard[0][0], 2 + playerName1 + 1);
      assert.deepEqual(jsonBoard[0][1], 0 + playerName2 + 1);
      assert.deepEqual(jsonBoard[3][2], 1 + playerName1 + 2);
    });
    it('outputs normal heights at all locations not occupied by workers', function () {
      let numWorkers = 0;
      for (let y = 0; y < jsonBoard.length; y++) {
        for (let x = 0; x < jsonBoard[y].length; x++) {
          let boardValue = jsonBoard[y][x];
          if (typeof boardValue === 'string') {
            numWorkers++;
            continue;
          }
          assert.equal(boardValue, initBoard[y][x]);
        }
      }
      assert.equal(numWorkers, 3);
    });
    it('outputs the whole Board', function () {
      assert.equal(jsonBoard.length, 6);
      for (let row = 0; row < 6; row++) {
        assert.equal(jsonBoard[row].length, 6);
      }
    });
  });
  describe('gameResultsToJson', function () {
    let gameResults;
    beforeEach(function () {
      gameResults = [new GameResult(p1, p2, WON),
        new GameResult(p2, p1, WON),
        new GameResult(p1, p2, WON),
        new GameResult(p1, p3, BROKEN_RULE)];
    });
    it('translates each GameResult in the list into an EncounterOutcome', function () {
      let expectedEncounterOutcomes = [[p1, p2], [p2, p1], [p1, p2], [p1, p3, "irregular"]];
      assert.deepEqual(MC.gameResultsToJson(gameResults), expectedEncounterOutcomes);
    });
  });
  describe('jsonToPlaceRequest', function () {
    let place;
    beforeEach(function () {
      place = [4, 5];
    });
    it('converts the Place to a PlaceRequest with the correct name', function () {
      let expectedPlaceRequest = { player: p1, x: 4, y: 5 };
      assert.deepEqual(MC.jsonToPlaceRequest(place, p1), expectedPlaceRequest);
    });
  });
  describe('jsonToTurn', function () {
    it('converts a move action into a Turn with only a move', function () {
      let moveAction = [p1 + 1, Direction.EAST, Direction.SOUTH];
      let workerRequest = { player: p1, id: 1 }
      let expectedTurn = [["move", workerRequest, Direction.directions.EASTSOUTH]];
      assert.deepEqual(MC.jsonToTurn(moveAction), expectedTurn);
    });
    it('converts a move-build action into a move-build Turn', function () {
      let moveBuildAction = [p1 + 2, Direction.WEST, Direction.PUT, Direction.WEST, Direction.NORTH];
      let workerRequest = { player: p1, id: 2 };
      let expectedTurn = [["move", workerRequest, Direction.directions.WESTPUT], ["build", Direction.directions.WESTNORTH]]
      assert.deepEqual(MC.jsonToTurn(moveBuildAction), expectedTurn);
    });
  });
});