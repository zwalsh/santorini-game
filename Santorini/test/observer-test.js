const assert = require('chai').assert;
const sinon = require('sinon');
const Board = require('../Common/board');
const c = require('../Common/constants');
const Observer = require('../Observer/observer');
const Worker = require('../Common/worker');
const GameResult = require('../Common/game-result');

describe('Observer tests', function () {
  let observer;
  beforeEach(function () {
    observer = new Observer();
  });

  // Note on Observer unit tests:
  // workerPlaced, turnTaken, and gameOver methods simply call their corresponding
  // JSON conversion methods on their input data, and send
  // the results to printJson().
  // printJson() stringifies its input and writes it to process.stdout,
  // which is not a meaningful behavior to test.
  // Therefore the only meaningful unit tests for this module are the JSON
  // conversion methods themselves, below.

  describe('Json conversion methods', function () {
    describe('Turn to JSON', function () {
      let move, build, pName, workerId;
      beforeEach(function () {
        pName = 'garth';
        workerId = 1;
        move = ["move", {player: pName, id: workerId}, ["EAST", "NORTH"]];
        build = ["build", ["WEST", "SOUTH"]];
      });

      it('converts the Worker correctly', function () {
        let turn = [move, build];
        assert.deepEqual(observer.turnToJson(turn)[0], 'garth1');
      });
      it('converts a Move-only turn correctly', function () {
        let turn = [move];
        assert.deepEqual(observer.turnToJson(turn), ['garth1', "EAST", "NORTH"]);
      });
      it('converts a Move-Build turn correctly', function () {
        let turn = [move, build];
        assert.deepEqual(observer.turnToJson(turn), ['garth1', "EAST", "NORTH", "WEST", "SOUTH"]);
      });
    });
    describe('GameResult to JSON', function () {
      let p1Name, p2Name;
      beforeEach(function () {
        p1Name = "wayne";
        p2Name = "garth";
        observer.startGame(p1Name, p2Name);
      });
      it('outputs the winner\'s name if they won the game cleanly', function () {
        let gameResult = new GameResult(p1Name, p2Name, c.EndGameReason.WON);
        assert.deepEqual(observer.gameResultToJson(gameResult), "Player wayne won the game!");
      });
      it('outputs the winner\'s name and the opponent\'s name if the opponent broke a rule', function () {
        let gameResult = new GameResult(p2Name, p1Name, c.EndGameReason.BROKEN_RULE);
        assert.deepEqual(observer.gameResultToJson(gameResult), "Player garth won because Player wayne broke the rules.");
      });
    });
    describe('Board to JSON', function () {
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
        jsonBoard = observer.boardToJson(board);
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
  });
});