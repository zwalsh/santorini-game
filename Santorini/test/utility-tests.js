let assert = require('chai').assert;
let Utility = require('../Common/json-to-component');

describe('utility tests', function() {
  let boardSpec = [[0, 1, 2, 3, 2, 1],
    [1, 1, 1, "1alfred2", 1, 1],
    [3, 3, 3, 3, 3, 3],
    [4, 3, 2, "1sampson2", 0, 0],
    [3, 4, 2, 3, 1, 2],
    [1, 0, 0, 0, "0alfred1", "1sampson1"]];


  describe('jsonParser', function() {
    it('should return valid list of JSON', function() {
      let arrJSON = Utility.jsonParser("[\"Hello\"][\"World\"]");
      let arrJSON2 = Utility.jsonParser("[\"Hello\"]\n[\"World\"]");
      assert.isTrue(Utility.jsonParser("[2]")[0][0] === 2);
      assert.isTrue(arrJSON[0][0] === "Hello");
      assert.isTrue(arrJSON[1][0] === "World");
      assert.isTrue(arrJSON2[0][0] === "Hello");
      assert.isTrue(arrJSON2[1][0] === "World");
    });
  });

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

