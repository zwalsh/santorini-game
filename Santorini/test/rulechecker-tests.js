let assert = require('chai').assert;
let Worker = require('../Common/worker');
let Rulechecker = require('../Common/rulechecker');
let Board = require('../Common/board');

describe('Rulechecker Tests', function() {
  let rulechecker = new Rulechecker();

  //////////////// INIT WORKERS /////////////////////////////
  let listInitWorker1 = [{player: 'alfred', x:1, y:1}];
  let listInitWorkersFull = [{player: 'alfred', x:0, y:0}, {player: 'sampson', x:2, y:1},
    {player: 'alfred', x:1, y: 2}, {player: 'sampson', x:2, y:3}];
  //////////////////////////////////////////////////////////

  /////////////// Board Layouts ///////////////////////////
  // Clean board
  let cleanBoard =
      [[0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0]];

  // Board where w1 is on tile where H=3
  let winningBoardLayoutTrue =
    [[3, 2, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0]];

  // Board where w1 is on tile where H != 3
  let winningBoardLayoutFalse =
    [[2, 2, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0]];
  let w1 = new Worker(0, 0, 1, 'alfred');
  let w1Alt = new Worker(1, 0, 1, 'alfred');
  let w2 = new Worker(4, 1, 2, 'alfred');
  let w3 = new Worker(5, 1, 1, 'sampson');
  let w4 = new Worker(5, 5, 2, 'sampson');
  let listOfWorkers = [w1, w3, w2, w4];
  let listOfWorkersMoveToWin = [w1Alt, w3, w2, w4];
  let winningBoardTrue = new Board(null, winningBoardLayoutTrue, listOfWorkers);
  let winningBoardFalse = new Board(null, winningBoardLayoutFalse, listOfWorkers);
  let winningBoardTrueMove = new Board(null, winningBoardLayoutTrue, listOfWorkersMoveToWin);

  // Both workers of one player are boxed in
  let boxInBoardLayoutTrue =
    [[0, 4, 0, 0, 0, 0],
    [4, 4, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 4, 4],
    [0, 0, 0, 0, 4, 0]];

  // One worker of one player is boxed in
  let boxInBoardLayoutFalse =
    [[0, 4, 0, 0, 0, 0],
      [4, 4, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 4, 4],
      [0, 0, 0, 0, 0, 0]];
  let w5 = new Worker(0, 0, 1, 'alfred');
  let w6 = new Worker(5, 5, 2, 'alfred');
  let w7 = new Worker(5, 1, 1, 'sampson');
  let w8 = new Worker(5, 2, 2, 'sampson');
  let listOfWorkers2 = [w5, w6, w7, w8];
  let boxInBoardTrue = new Board(null, boxInBoardLayoutTrue, listOfWorkers2);
  let boxInBoardFalse = new Board(null, boxInBoardLayoutFalse, listOfWorkers2);

  // alfred boxed in by workers and building
  let boxedInByPlayersAndBuildingTrue =
    [[0, 0, 4, 0, 0, 0],
      [0, 0, 4, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0]];

  // alfred W2 can move
  let boxedInByPlayersAndBuildingFalse =
    [[0, 0, 0, 0, 0, 0],
      [0, 0, 4, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0]];
  let w9 = new Worker(0, 0, 1, 'alfred');
  let w10 = new Worker(1, 0, 2, 'alfred');
  let w11 = new Worker(0, 1, 1, 'sampson');
  let w12 = new Worker(1, 1, 2, 'sampson');
  let listOfWorkers3 = [w9, w10, w11, w12];
  let boxedInByPlayersAndBuildingTrueBoard = new Board(null, boxedInByPlayersAndBuildingTrue, listOfWorkers3);
  let boxedInByPlayersAndBuildingFalseBoard = new Board(null, boxedInByPlayersAndBuildingFalse, listOfWorkers3);

  let suicideBoardLayout =
    [[0, 4, 0, 0, 0, 0],
      [2, 4, 4, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 4, 4],
      [0, 0, 0, 0, 4, 0]];
  let w13 = new Worker(0, 1, 1, 'alfred');
  let w14 = new Worker(5, 5, 2, 'alfred');
  let w15 = new Worker(0, 1, 1, 'sampson');
  let w16 = new Worker(1, 1, 2, 'sampson');
  let listOfWorkers4 = [w13, w14, w15, w16];
  let suicideBoard = new Board(null, suicideBoardLayout, listOfWorkers4);

  let invalidMoveBuildLayout =
    [[0, 4, 0, 0, 0, 0],
      [0, 4, 4, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 4, 0],
      [0, 0, 0, 0, 4, 0]];
  let w17 = new Worker(0, 0, 1, 'alfred');
  let w18 = new Worker(5, 5, 2, 'alfred');
  let w19 = new Worker(0, 1, 1, 'sampson');
  let w20 = new Worker(1, 1, 2, 'sampson');
  let listOfWorkers5 = [w17, w18, w19, w20];
  let invalidMoveBuildBoard = new Board(null, invalidMoveBuildLayout, listOfWorkers5);

  // Board used for everything besides game ending conditions - do not modify
  let board = new Board(listInitWorkersFull);
  /////////////////////////////////////////////////////////


  describe('isValidPlace', function() {
    it('valid initial placement', function() {
      assert.isTrue(rulechecker.isValidPlace(listInitWorker1, 2, 2), 'Initial placement is valid');
    });
    it('should return false if tile is occupied, tile is out of bounds', function() {
      assert.isFalse(rulechecker.isValidPlace(listInitWorker1, 1, 1), 'Target Tile is occupied');
      assert.isFalse(rulechecker.isValidPlace(listInitWorker1, 8, 2), 'Target Tile is out of bounds');
    });
  });

  describe('tileIsInBounds', function() {
    it('should return true if x and y are <= 5', function() {
      assert.isTrue(rulechecker.tileIsInBounds(2, 3), 'Tile is in bounds');
      assert.isFalse(rulechecker.tileIsInBounds(2, 6), 'Y coordinate is out of bounds');
      assert.isFalse(rulechecker.tileIsInBounds(7, 2), 'X coordinate is out of bounds');
    });
  });

  describe('checkValid', function() {
    it('All checkValid conditions passed', function() {
      assert.isTrue(rulechecker.checkValid(board, {player: 'alfred', id: 1}, ["EAST", "PUT"]), 'All checkValid condition pass');
    });
    it('A checkValid condition fails', function() {
      assert.isFalse(rulechecker.checkValid(board, {player: 'alfred', id: 1}, ["PUT", "PUT"]), 'Cannot act on current location - PUTPUT');
      assert.isFalse(rulechecker.checkValid(board, {player: 'alfred', id: 1}, ["WEST", "PUT"]), 'Target tile out of bounds');
      assert.isFalse(rulechecker.checkValid(board, {player: 'sampson', id: 2}, ["WEST", "NORTH"]), 'Target tile is occupied');
      board.buildWithWorker({player: 'alfred', id: 1}, ["EAST", "PUT"]);
      board.buildWithWorker({player: 'alfred', id: 1}, ["EAST", "PUT"]);
      board.buildWithWorker({player: 'alfred', id: 1}, ["EAST", "PUT"]);
      board.buildWithWorker({player: 'alfred', id: 1}, ["EAST", "PUT"]);
      assert.isFalse(rulechecker.checkValid(board, {player: 'alfred', id: 1}, ["EAST", "PUT"]), 'Target tile Height >= 4');
    });
  });

  /**
   * A WorkerRequest is a: {player: string , id: int}
   * A MoveRequest is a: ["move", WorkerRequest, Direction]
   * A BuildRequest is a: ["build", Direction]
   * A Turn is a [MoveRequest, BuildRequest]
   */
  describe('isValidTurn', function() {
    let p1name, workerId, worker, board;
    beforeEach(function () {
      p1name = 'wallace';
      workerId = 1;
      let heights =
        [ [0, 0, 0, 0, 0, 0],
          [3, 4, 4, 0, 0, 0],
          [2, 2, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0] ];
      worker = new Worker(0, 2, workerId, p1name); // remember x=col, y=row. Board indexes [y][x]
      let workerList = [worker];
      board = new Board(null, heights, workerList);

    });
    describe('given a move-only turn that is not valid', function () {
      let turn;
      beforeEach(function () {
        turn = [["move", { player:p1name, id:workerId }, ["EAST","NORTH"]]];
      });
      it('rejects the turn', function () {
        assert.isFalse(rulechecker.isValidTurn(board, turn));
      });
    });

    describe('given a move-only turn that is a winning move', function () {
      let turn;
      beforeEach(function () {
        turn = [["move", { player:p1name, id:workerId }, ["PUT","NORTH"]]];
      });
      it('accepts the turn', function () {
        assert.isTrue(rulechecker.isValidTurn(board, turn));
      });
    });

    describe('given a move-only turn that is not a winning move', function () {
      let turn;
      beforeEach(function () {
        turn = [["move", { player:p1name, id:workerId }, ["EAST","PUT"]]];
      });
      it('rejects the turn', function () {
        assert.isFalse(rulechecker.isValidTurn(board, turn));
      });
    });

    describe('given a move-build turn where the move is invalid', function () {
      let turn;
      beforeEach(function () {
        turn = [["move", { player:p1name, id:workerId }, ["EAST","NORTH"]],
                ["build", ["PUT","NORTH"]]];
      });
      it('rejects the turn', function () {
        assert.isFalse(rulechecker.isValidTurn(board, turn));
      });
    });

    describe('given a move-build turn where the move is a winning move', function () {
      let turn;
      beforeEach(function () {
        turn = [["move", { player:p1name, id:workerId }, ["PUT","NORTH"]],
          ["build", ["PUT","NORTH"]]];
      });
      it('rejects the turn', function () {
        assert.isFalse(rulechecker.isValidTurn(board, turn));
      });
    });

    describe('given a move-build turn where the build is invalid', function () {
      let turn;
      beforeEach(function () {
        turn = [["move", { player:p1name, id:workerId }, ["EAST","PUT"]],
          ["build", ["PUT","NORTH"]]];
      });
      it('rejects the turn', function () {
        assert.isFalse(rulechecker.isValidTurn(board, turn));
      });
    });

    describe('given a move-build turn that is completely valid', function () {
      let turn;
      beforeEach(function () {
        turn = [["move", { player:p1name, id:workerId }, ["EAST","PUT"]],
          ["build", ["WEST","NORTH"]]];
      });
      it('accepts the turn', function () {
        assert.isTrue(rulechecker.isValidTurn(board, turn));
      });
    });
  });

  describe('isValidMove', function() {
    it('checkValid() passes and a worker is not moving to a tile > 1 their current height', function() {
      assert.isTrue(rulechecker.isValidMove(board, {player: 'alfred', id: 1}, ["PUT", "SOUTH"]), 'Valid move performed');
    });
    it('worker is moving to tile that is too tall', function() {
      board.buildWithWorker({player: 'alfred', id: 1}, ["EAST", "PUT"]);
      board.buildWithWorker({player: 'alfred', id: 1}, ["EAST", "PUT"]);
      assert.isFalse(rulechecker.isValidMove(board, {player: 'alfred', id: 1}, ["EAST", "PUT"]), 'Worker cannot move to tile with height difference > 1');
    });
  });

  describe('isValidBuild', function() {
    it('should return true if checkValid() passes.', function() {
      assert.isTrue(rulechecker.isValidBuild(board, {player: 'alfred', id: 1}, ["PUT", "SOUTH"]), 'Worker makes a valid build aka checkValid passes');
    });
  });

  describe('isValidMoveBuild', function() {
    it('Valid combos of moves and builds', function() {
      assert.isTrue(rulechecker.isValidMoveBuild(board, {player: 'alfred', id: 1}, ["PUT", "SOUTH"], ["EAST", "PUT"]), 'Valid move and build');
      assert.isTrue(rulechecker.isValidMoveBuild(winningBoardTrueMove, {player: 'alfred', id: 1}, ["WEST", "PUT"], ["WEST", "PUT"]), 'Valid move to win, invalid build '); //valid move and win
      assert.isTrue(rulechecker.isValidMoveBuild(suicideBoard, {player: 'alfred', id: 1}, ["PUT", "NORTH"], ["EAST", "PUT"]), 'Valid move to lose, invalid build');
      assert.isTrue(w13.posn.x === 0 && w13.posn.y === 1, 'Cloned board did not corrupt game board')
    });
    it('Invalid combos of moves and builds', function() {
      assert.isFalse(rulechecker.isValidMoveBuild(invalidMoveBuildBoard, {player: 'alfred', id: 1}, ["EAST", "PUT"], ["PUT", "SOUTH"]), 'Move is invalid');
      assert.isFalse(rulechecker.isValidMoveBuild(invalidMoveBuildBoard, {player: 'alfred', id: 1}, ["PUT", "SOUTH"], ["EAST", "PUT"]), 'Move is valid, build is invalid, non-gameover state');

    });
  });

  describe('Game Over Conditions', function() {

    it('hasWon - canReachWinningHeight', function() {
      assert.isTrue(rulechecker.hasWon(winningBoardTrue, 'alfred'), 'alfred should have won by being on tile where H = 3.');
      assert.isFalse(rulechecker.hasWon(winningBoardFalse, 'alfred'), 'alfred has not won because his H != 3.')
    });
    it('hasLost - workersCantMove - buildingAndWorkerBoxIn', function() {
      assert.isTrue(rulechecker.hasLost(boxedInByPlayersAndBuildingTrueBoard, 'alfred'), 'All of alfred workers are boxed in by players/buildings, sampson won');
      assert.isFalse(rulechecker.hasLost(boxedInByPlayersAndBuildingFalseBoard, 'alfred'), 'One of alfred workers can move, sampson does not win');
    });
    it('hasLost - workersCantMove - buildingBoxIn', function() {
      assert.isTrue(rulechecker.hasLost(boxInBoardTrue, 'alfred'), 'All of alfred workers are boxed in by buildings');
      assert.isFalse(rulechecker.hasLost(boxInBoardFalse, 'alfred'), 'Only one of alfred workers are boxed in');
    });
  });
});