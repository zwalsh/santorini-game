let assert = require('chai').assert;
let Board = require('../Common/board');
let Worker = require('../Common/worker');

describe('Board Tests', function () {


  let boardLayout =
    [[0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0]];
  let w1 = new Worker(0, 0, 1, 'alfred');
  let w2 = new Worker(0, 1, 2, 'alfred');
  let w3 = new Worker(5, 1, 1, 'sampson');
  let w4 = new Worker(5, 5, 2, 'sampson');
  let listOfWorkers = [w1, w3, w2, w4];
  let board2 = new Board(null, boardLayout, listOfWorkers);

  let listOfInitWorkers = [{player: 'alfred', x: 0, y: 0}, {player: 'sampson', x: 5, y: 1},
    {player: 'alfred', x: 3, y: 3}, {player: 'sampson', x: 5, y: 3}];

  let board = new Board(listOfInitWorkers);

  describe('createBoard', function () {
    it('should return board with 6 rows and 6 columns', function () {
      let b = Board.createBoard(6, 6);
      assert.isTrue(b.length === 6 && b[0].length === 6)
    });
    it('should return board with wrong number of rows or columns', function () {
      let b = Board.createBoard(6, 6);
      assert.isFalse(b.length === 3 && b[0].length === 6);
      assert.isFalse(b.length === 6 && b[0].length === 2);
    });
  });

  describe('createWorkerList', function () {
    it('should return a list of workers', function () {
      let wl = Board.createWorkerList(listOfInitWorkers);
      assert.isTrue(wl.length === 4);
      assert.isTrue(wl[0].player === 'alfred' && wl[0].id === 1);
    });
  });

  describe('moveWorker', function () {
    it('should return true if moved correctly', function () {
      assert.isTrue(board.workers[0].posn.x === 0 && board.workers[0].posn.y === 0);
      board.moveWorker({player: 'alfred', id: 1}, ["EAST", "PUT"]);
      assert.isTrue(board.workers[0].posn.x === 1 && board.workers[0].posn.y === 0);
      board.moveWorker({player: 'alfred', id: 1}, ["WEST", "PUT"]);
      assert.isTrue(board.workers[0].posn.x === 0 && board.workers[0].posn.y === 0);
      board.moveWorker({player: 'alfred', id: 1}, ["PUT", "SOUTH"]);
      assert.isTrue(board.workers[0].posn.x === 0 && board.workers[0].posn.y === 1);
      board.moveWorker({player: 'alfred', id: 1}, ["PUT", "NORTH"]);
      assert.isTrue(board.workers[0].posn.x === 0 && board.workers[0].posn.y === 0);
      board.moveWorker({player: 'alfred', id: 1}, ["EAST", "SOUTH"]);
      assert.isTrue(board.workers[0].posn.x === 1 && board.workers[0].posn.y === 1);
      board.moveWorker({player: 'alfred', id: 1}, ["WEST", "NORTH"]);
      assert.isTrue(board.workers[0].posn.x === 0 && board.workers[0].posn.y === 0);
      board.moveWorker({player: 'alfred', id: 2}, ["EAST", "NORTH"]);
      assert.isTrue(board.workers[2].posn.x === 4 && board.workers[2].posn.y === 2);
      board.moveWorker({player: 'alfred', id: 2}, ["WEST", "SOUTH"]);
      assert.isTrue(board.workers[2].posn.x === 3 && board.workers[2].posn.y === 3);
    });
  });

  describe('buildWithWorker', function () {
    it('should return true if built correctly', function () {
      assert.isTrue(board.board[3][3] === 0);
      board.buildWithWorker({player: 'alfred', id: 2}, ["EAST", "PUT"]);
      assert.isTrue(board.heightAtTile(4, 3) === 1);
      board.buildWithWorker({player: 'alfred', id: 2}, ["WEST", "PUT"]);
      assert.isTrue(board.heightAtTile(2, 3) === 1);
      board.buildWithWorker({player: 'alfred', id: 2}, ["PUT", "SOUTH"]);
      assert.isTrue(board.heightAtTile(3, 4) === 1);
      board.buildWithWorker({player: 'alfred', id: 2}, ["PUT", "NORTH"]);
      assert.isTrue(board.heightAtTile(3, 2) === 1);
      board.buildWithWorker({player: 'alfred', id: 2}, ["EAST", "SOUTH"]);
      assert.isTrue(board.heightAtTile(4, 4) === 1);
      board.buildWithWorker({player: 'alfred', id: 2}, ["WEST", "NORTH"]);
      assert.isTrue(board.heightAtTile(2, 2) === 1);
      board.buildWithWorker({player: 'alfred', id: 2}, ["EAST", "NORTH"]);
      assert.isTrue(board.heightAtTile(4, 2) === 1);
      board.buildWithWorker({player: 'alfred', id: 2}, ["WEST", "SOUTH"]);
      assert.isTrue(board.heightAtTile(2, 4) === 1);
    });

    describe('workerNeighborTileIsOccupied', function () {
      it('worker neighbor is occupied', function () {
        assert.isTrue(board2.workerNeighborIsOccupied({player: 'alfred', id: 1}, ["PUT", "SOUTH"]), 'Tile south of worker is occupied')
      });
      it('worker neighbor is not occupied', function () {
        assert.isFalse(board2.workerNeighborIsOccupied({player: 'alfred', id: 1}, ["EAST", "PUT"]), 'Tile south of worker is occupied')
        assert.isFalse(board2.workerNeighborIsOccupied({player: 'alfred', id: 1}, ["WEST", "PUT"]), 'Tile west of worker is out of bounds')
      });
    });
  });

});