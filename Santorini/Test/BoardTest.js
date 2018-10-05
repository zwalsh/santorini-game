const Board = require('./../Common/Board.js');

describe("Board tests: ", function() {
  let board;
  beforeEach(function() {
    board = new Board();
  });

  describe("add worker", function() {
    let workerId0;
    let workerId1;
    let workerId2;
    let workerId3;
    it("adds a worker to the board", function() {
      workerId0 = board.placeWorker(0,0);
      expect(board.getWorker(workerId0)).toBe([0,0]);
    });
    it("adds four workers to the board", function() {
      workerId0 = board.addWorker(0,0);
      workerId1 = board.addWorker(1,1);
      workerId2 = board.addWorker(2,2);
      workerId3 = board.addWorker(3,3);
      expect(board.getWorker(workerId0)).toBe([0,0]);
      expect(board.getWorker(workerId1)).toBe([1,1]);
      expect(board.getWorker(workerId2)).toBe([2,2]);
      expect(board.getWorker(workerId3)).toBe([3,3]);
    });
    it("does not allow more than four workers to be added", function() {
      workerId0 = board.addWorker(0,0);
      workerId1 = board.addWorker(1,1);
      workerId2 = board.addWorker(2,2);
      workerId3 = board.addWorker(3,3);
      workerId4 = board.addWorker(4,4);
      expect(workerId4).toBe(false);
    });
    it("does not allow workers to be placed on top of other workers", function() {
      // todo
    });
  });
  
  describe("move worker", function() {
    it("checks that the worker exists", function() {
  
    });
    it("checks that destination is on the board and empty", function() {
  
    });
    it("moves the worker to that location", function() {
  
    });
    it("does not move any other workers", function() {
  
    });
  });
  
  describe("build floor", function() {
    it("checks that the worker exists", function() {
  
    });
    it("checks that destination is on the board and empty", function() {
  
    });
    it("checks that the target height is less than max height", function() {
  
    });
    it("increases the height of that cell", function() {
  
    });
  });
  
  describe("getters", function() {
    describe("can't mutate internal state", function() {
      it("getHeights returns a copy", function() {
  
      });
      it("getWorkers returns a copy", function() {
  
      });
      it("getWorker returns a copy", function() {
  
      });
    });
    describe("returns correct values", function() {
      it("getHeight checks that the value is on the board", function() {
  
      });
    })
  });
});

