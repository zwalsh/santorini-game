let expect = require('chai').expect;
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
      workerId0 = board.addWorker(0,0);
      expect(board.getWorker(workerId0)).to.eql([0,0]);
    });
    it("adds four workers to the board", function() {
      workerId0 = board.addWorker(0,0);
      workerId1 = board.addWorker(1,1);
      workerId2 = board.addWorker(2,2);
      workerId3 = board.addWorker(3,3);
      expect(board.getWorker(workerId0)).to.eql([0,0]);
      expect(board.getWorker(workerId1)).to.eql([1,1]);
      expect(board.getWorker(workerId2)).to.eql([2,2]);
      expect(board.getWorker(workerId3)).to.eql([3,3]);
    });
    it("does not allow more than four workers to be added", function() {
      workerId0 = board.addWorker(0,0);
      workerId1 = board.addWorker(1,1);
      workerId2 = board.addWorker(2,2);
      workerId3 = board.addWorker(3,3);
      workerId4 = board.addWorker(4,4);
      expect(workerId4).to.equal(false);
    });
    it("does not allow workers to be placed on top of other workers", function() {
      workerId0 = board.addWorker(1,1);
      expect(workerId0).to.eql(0);
      workerId1 = board.addWorker(1,1);
      expect(workerId1).to.eql(false);
      let workers = board.getWorkers();
      expect(workers.length).to.eql(1);
      expect(workers[0]).to.eql([1,1]);
    });
  });

  describe("move worker", function() {
    let workerId0;
    beforeEach(function() {
      workerId0 = board.addWorker(3,3);
    });
    it("checks that the worker exists", function() {
      let movedWorker = board.moveWorker(1, 2, 2);
      expect(movedWorker).to.eql(false);
      movedWorker = board.moveWorker(-4, 2, 2);
      expect(movedWorker).to.eql(false);
    });
    it("checks that destination is on the board and empty", function() {
      // adjacent to worker 0
      let workerId1 = board.addWorker(4,4);
      let movedWorker = board.moveWorker(workerId1, 3, 3);
      expect(movedWorker).to.eql(false);
      let workers = board.getWorkers();
      expect(workers.length).to.eql(2);
      expect(workers[0]).to.eql([3,3]);
      expect(workers[1]).to.eql([4,4]);
    });
    it("moves the worker to that location", function() {
      let movedWorker = board.moveWorker(workerId0, 3, 4);
      expect(movedWorker).to.eql(true);
      expect(board.getWorkers().length).to.eql(1);
      expect(board.getWorker(workerId0)).to.eql([3,4]);
    });
    it("does not move any other workers", function() {
      let workerId1 = board.addWorker(5,5);
      let workerId2 = board.addWorker(1,3);
      let workerId3 = board.addWorker(0,2);
      board.moveWorker(workerId0, 3, 5);
      let workers = board.getWorkers();
      expect(workers.length).to.eql(4);
      expect(workers[workerId0]).to.eql([3,5]);
      expect(workers[workerId1]).to.eql([5,5]);
      expect(workers[workerId2]).to.eql([1,3]);
      expect(workers[workerId3]).to.eql([0,2]);
    });
    it("allows movement even to higher square", function() {
      board.buildFloor(workerId0, 4, 4);
      board.buildFloor(workerId0, 4, 4);
      board.buildFloor(workerId0, 4, 4);
      let movedWorker = board.moveWorker(workerId0, 4, 4);
      expect(movedWorker).to.eql(true);
      expect(board.getHeight(4,4)).to.eql(3);
      expect(board.getWorker(workerId0)).to.eql([4,4]);
    });
  });

  describe("build floor", function() {
    let workerId0;
    let initialHeights;
    beforeEach(function() {
      workerId0 = board.addWorker(2,2);
      initialHeights = board.getHeights();
    });
    it("checks that the worker exists", function() {
      let builtFloor = board.buildFloor(workerId0 + 1, 3, 3);
      expect(builtFloor).to.eql(false);
      expect(board.getHeights()).to.eql(initialHeights);
    });
    it("checks that destination is on the board and empty", function() {
      // off the board
      let builtFloor = board.buildFloor(workerId0, -1, -1);
      expect(builtFloor).to.eql(false);
      expect(board.getHeights()).to.eql(initialHeights);

      // occupied square
      let workerId1 = board.addWorker(3,3);
      builtFloor = board.buildFloor(workerId0, 3, 3);
      expect(builtFloor).to.eql(false);
      expect(board.getHeights()).to.eql(initialHeights);
    });
    it("checks that the target height is less than max height", function() {
      // directly mutating the heights to be at MAX_HEIGHT
      board.heights[3][3] = board.MAX_HEIGHT;
      initialHeights = board.getHeights();
      let builtFloor = board.buildFloor(workerId0, 3, 3)
      expect(builtFloor).to.eql(false);
      expect(board.getHeights()).to.eql(initialHeights);
    });
    it("increases the height of that cell", function() {
      board.buildFloor(workerId0, 3, 3);
      expect(board.getHeight(3,3)).to.eql(1);
    });
  });

  describe("getters", function() {
    describe("can't mutate internal state", function() {
      let heights;
      let workers;
      let worker;
      let workerId0;
      beforeEach(function() {
        workerId0 = board.addWorker(3,3);
        board.buildFloor(workerId0, 4, 4);
        heights = board.getHeights();
        workers = board.getWorkers();
        worker = board.getWorker(workerId0);
      });
      it("getHeights returns a copy", function() {
        heights[4][4] = 3;
        expect(board.getHeight(4,4)).to.eql(1);
        heights[3][0] = 1;
        expect(board.getHeight(3,0)).to.eql(0);
        expect(board.getHeights()).not.to.eql(heights);
      });
      it("getWorkers returns a copy", function() {
        workers[workerId0] = [5,5];
        expect(board.getWorker(workerId0)).to.eql([3,3]);
        expect(board.getWorkers()).not.to.eql(workers);
      });
      it("getWorker returns a copy", function() {
        worker = [5,3];
        expect(board.getWorker(workerId0)).to.eql([3,3]);
      });
    });
    describe("returns correct values", function() {
      it("getHeight checks that the value is on the board", function() {
        let height = board.getHeight(4,4);
        expect(height).to.eql(0);
        height = board.getHeight(-1,-1);
        expect(height).to.eql(false);
      });
    })
  });
});
