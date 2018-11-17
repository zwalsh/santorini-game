let assert = require('chai').assert;
let Utility = require('../Common/json-to-component');

describe('utility tests', function() {
  let boardSpec = [[0, 1, 2, 3, 2, 1],
    [1, 1, 1, "1alfred2", 1, 1],
    [3, 3, 3, 3, 3, 3],
    [4, 3, 2, "1sampson2", 0, 0],
    [3, 4, 2, 3, 1, 2],
    [1, 0, 0, 0, "0alfred1", "1sampson1"]];

  describe('parseWorker', function() {
    it('should return valid WorkerRequest', function() {
      let workerRequest = Utility.parseWorker("alfred1");
      assert.isTrue(workerRequest.player === 'alfred' && workerRequest.id === 1);
      assert.isFalse(workerRequest.player === 'wrong' && workerRequest.id === 1);
    });
  });

  describe('parseBoard', function() {
    it('should return valid WorkerRequest', function() {
      let board = Utility.parseBoard(boardSpec);
      assert.isTrue(board.heightAtTile(2, 0) === 2);
      assert.isTrue(board.heightAtTile(5, 5) === 1);
      assert.isTrue(board.workers[0].player === 'alfred');
      assert.isFalse(board.workers[0].id === '1');
    });
  });
});

