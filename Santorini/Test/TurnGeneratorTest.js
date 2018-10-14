let expect = require('chai').expect;
/* Unit tests for the TurnGenerator component. */
const TurnGenerator = require('./../Common/TurnGenerator.js').TurnGenerator;
const Action = require('./../Common/Action.js');
const PlaceAction = Action.PlaceAction;
const MoveAction = Action.MoveAction;
const BuildAction = Action.BuildAction;
const Board = require('./../Common/Board.js');
const GameState = require('./../Common/GameState.js');
const Direction = require('./../Common/Direction.js');

const DIRS = Direction.MOVEMENT_DIRECTIONS;

describe("TurnGenerator test suite", function () {

  // Generates all 64 possible next moves for a worker
  describe("when a worker can move and build anywhere", function () {
    let board, placeAction, playerId0, workerStartLoc, gameState, tg, turns;
    // Construct a board and gamestate with one worker placed at the
    // center. Set the gamestate so it's the same player's turn again.
    beforeEach(function () {
      board = new Board();
      workerStartLoc = [3,3];
      placeAction = new PlaceAction(workerStartLoc);
      playerId0 = 0;
      gameState = new GameState(board);
      Action.execute(placeAction, gameState);
      gameState.flipTurn();
      tg = new TurnGenerator(gameState);
      turns = [];
      while (tg.hasNext()) {
        turns.push(tg.next());
      }
    });

    it("generates 64 actions for that worker", function () {
      expect(turns.length).to.eql(64);
    });

    it("generates 64 unique actions", function () {
      for (let move = 0; move < DIRS.length; move++) {
        for (let bld = 0; bld < DIRS.length; bld++) {
          let turn = turns[move*DIRS.length + bld];
          if (turn === undefined) {
            console.log(`move : ${move}, bld: ${bld}, turns: ${JSON.stringify(turns)}`);
          }
          let moveAction = turn[0];
          let bldAction = turn[1];
          let moveLoc = Direction.adjacentLocation(workerStartLoc, DIRS[move]);
          let bldLoc = Direction.adjacentLocation(moveLoc, DIRS[bld]);
          expect(moveAction.getLoc()).to.eql(moveLoc);
          expect(bldAction.getLoc()).to.eql(bldLoc);
        }
      }
    });
  });

  // Test gamestate where worker has one possible move build
  // to test transition from having a next move to not having a next move
  describe("when a worker only has one possible move+build", function () {

    let board, placeAction, playerId0, workerStartLoc, gameState, tg;
    // Construct a board and gamestate with one worker placed at the
    // top left corner, surrounded by 4-height bldgs but with 1 adjacent 1-height to
    // move to.
    beforeEach(function () {

      board = new Board();
      workerStartLoc = [0,5];
      board.heights[0][4] = 1;
      board.heights[0][3] = 4;
      board.heights[1][5] = 4;
      board.heights[1][4] = 4;
      board.heights[1][3] = 4;
      placeAction = new PlaceAction(workerStartLoc);
      playerId0 = 0;
      gameState = new GameState(board);
      Action.execute(placeAction, gameState);
      gameState.flipTurn();
      tg = new TurnGenerator(gameState);
    });

    it("generates the one possible action", function() {
      tg.hasNext();
      let turn = tg.next();
      let moveAction = turn[0];
      let bldAction = turn[1];
      let workerId = gameState.getWorkerList(playerId0)[0];
      expect(moveAction.getType()).to.eql(Action.MOVE);
      expect(moveAction.getLoc()).to.eql([0,4]);
      expect(moveAction.getWorkerId()).to.eql(workerId);
      expect(bldAction.getType()).to.eql(Action.BUILD);
      expect(bldAction.getLoc()).to.eql([0,5]);
      expect(bldAction.getWorkerId()).to.eql(workerId);
    });

    it("hasNext() returns true first, then false after next() is called", function () {
      expect(tg.hasNext()).to.eql(true);
      expect(tg.hasNext()).to.eql(false);
    });
  });

  // Test worker has no possible moves in given game board, hasNext() false
  describe("when a worker has no possible moves", function () {

    it("hasNext() returns false immediately", function () {

    });
  });

  // Test with 2 workers, that there are options for both of them
  // (first worker has 1 move only, to get to second worker)
  describe("when there are two workers", function () {

    it("generates all possible actions for the first worker, then the second", function () {

    });
  });

  describe("when used, does not mutate the GameState it is constructed with", function () {

  });

});