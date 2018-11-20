const chai = require('chai');
const assert = chai.assert;

const Board = require('../Common/board');
const Worker = require('../Common/worker');

const MC = require('../Remote/server-message-converter');

describe('ServerMessageConverter tests', function () {
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
});