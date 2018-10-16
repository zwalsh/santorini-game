let expect = require('chai').expect;
/* Unit tests for the TurnGenerator component. */
const TurnGenerator = require('./../Common/TurnGenerator.js').TurnGenerator;
const Action = require('./../Common/Action.js');
const PlaceAction = Action.PlaceAction;
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
      // To flip the turn back to player 1, place another worker
      // also tests that turns are only generated for the player whose turn it is
      Action.execute(new PlaceAction([0,0]), gameState);
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
      // To flip the turn back to player 1, place another worker
      // also tests that turns are only generated for the player whose turn it is
      Action.execute(new PlaceAction([5,5]), gameState);
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
      tg.next();
      expect(tg.hasNext()).to.eql(false);
    });
  });

  // Test worker has no possible moves in given game board, hasNext() false
  describe("when a worker has no possible moves", function () {

    let board, placeAction, playerId0, workerStartLoc, gameState, tg;
    // Construct a board and gamestate with one worker placed at the
    // top left corner, completely surrounded by 4-height bldgs.
    beforeEach(function () {

      board = new Board();
      workerStartLoc = [0,5];
      board.heights[0][4] = 4;
      board.heights[1][4] = 4;
      board.heights[1][5] = 4;
      placeAction = new PlaceAction(workerStartLoc);
      playerId0 = 0;
      gameState = new GameState(board);
      Action.execute(placeAction, gameState);
      // To flip the turn back to player 1, place another worker
      // also tests that turns are only generated for the player whose turn it is
      Action.execute(new PlaceAction([5,5]), gameState);
      tg = new TurnGenerator(gameState);
    });

    it("hasNext() returns false immediately", function () {
      expect(tg.hasNext()).to.eql(false);
    });
  });

  describe("when the worker has a winning move", function () {

    let board, placeAction, playerId0, workerStartLoc, gameState, tg, turns;
    // Construct a board and gamestate with one worker placed at the
    // top left corner, completely surrounded by 4-height bldgs.
    beforeEach(function () {
      /* Board:      Worker at:
        2 , 3 , 4     [0,0]
        2 , 2 , 4
        4 , 4 , 4      */
      board = new Board();
      workerStartLoc = [0,0];
      board.heights[0][0] = 2;
      board.heights[0][1] = 3;
      board.heights[0][2] = 4
      board.heights[1][0] = 2;
      board.heights[1][1] = 2;
      board.heights[1][2] = 4;
      board.heights[2][0] = 4;
      board.heights[2][1] = 4;
      board.heights[2][2] = 4;
      placeAction = new PlaceAction(workerStartLoc);
      playerId0 = 0;
      gameState = new GameState(board);
      Action.execute(placeAction, gameState);
      // To flip the turn back to player 1, place another worker
      // also tests that turns are only generated for the player whose turn it is
      Action.execute(new PlaceAction([5,5]), gameState);
      turns = [];
      tg = new TurnGenerator(gameState);
      while (tg.hasNext()) {
        turns.push(tg.next());
      }
    });

    it("generates a turn with just that move", function () {
      let winMove = turns.filter(turn => (turn.length === 1))[0][0];
      let expectedLoc = Direction.adjacentLocation(workerStartLoc, Direction.EAST);
      expect(winMove.getLoc()).to.eql(expectedLoc);
    });

    it("only generates one turn with that move", function () {
      // Get all Turns that have a move to the winning location
      let turnsWithWinMove = turns.filter((turn) => {
        let moveLoc = turn[0].getLoc();
        return moveLoc[0] === 0 && moveLoc[1] === 1;
      });
      // There should only be one such turn
      expect(turnsWithWinMove.length).to.eql(1);
    });

    it("generates move-build pairs for its other non-winning moves", function () {
      // Get all Turns that do not have a Move to the winning location
      let turnsNotWithWinMove = turns.filter((turn) => {
        let moveLoc = turn[0].getLoc();
        // Keep the turn if it's not a move to [0,1]
        return moveLoc[0] !== 0 || moveLoc[1] !== 1;
      });
      // There should be 6 of those turns (2 moves, 3 builds each)
      expect(turnsNotWithWinMove.length).to.eql(6);

    });
  });

  // Test with 2 workers, that there are options for both of them
  // (first worker has 1 move only, to get to second worker)
  describe("when there are two workers", function () {
    describe("when both workers have available moves", function () {
      let board, playerId0, worker0StartLoc, worker1StartLoc, worker0Id
        , worker1Id, gameState, tg, turns;
      /* Board:      Workers at:
        0 , 0 , 4     [0,0] and [0,1]
        0 , 0 , 4
        4 , 4 , 4      */
      beforeEach(function () {
        board = new Board();
        playerId0 = 0;
        worker0StartLoc = [0,0];
        worker1StartLoc = [0,1];
        board.heights[0][0] = 0;
        board.heights[0][1] = 0;
        board.heights[0][2] = 4;
        board.heights[1][0] = 0;
        board.heights[1][1] = 0;
        board.heights[1][2] = 4;
        board.heights[2][0] = 4;
        board.heights[2][1] = 4;
        board.heights[2][2] = 4;

        // Place worker at [0,0] for player 1
        gameState = new GameState(board);
        Action.execute(new PlaceAction(worker0StartLoc), gameState);
        // To flip the turn back to player 1, place another worker
        // also tests that turns are only generated for the player whose turn it is
        Action.execute(new PlaceAction([5,5]), gameState);
        // Place worker at [0,1] for player 1
        Action.execute(new PlaceAction(worker1StartLoc), gameState);
        worker0Id = gameState.getWorkerList(playerId0)[0];
        worker1Id = gameState.getWorkerList(playerId0)[1];

        // Flip turn back to player 1's turn
        gameState.flipTurn();
        tg = new TurnGenerator(gameState);
        // generate all possible turns for player 1
        turns = [];
        while (tg.hasNext()) {
          turns.push(tg.next());
        }
      });

      it("generates all possible Turns for the first worker, then the second", function () {
        // each worker has 2 move options with 2 build options each
        expect(turns.length).to.eql(8);
        // each Turn is a move-build
        for (let turn of turns) {
          expect(turn.length).to.eql(2);
          expect(turn[0].getType()).to.eql(Action.MOVE);
          expect(turn[1].getType()).to.eql(Action.BUILD);
          expect(turn[0].getWorkerId()).to.eql(turn[1].getWorkerId());
        }
        let worker0Turns = turns.filter(turn => (turn[0].getWorkerId() === worker0Id));
        let worker1Turns = turns.filter(turn => (turn[0].getWorkerId() === worker1Id));
        expect(worker0Turns.length).to.eql(4);
        expect(worker1Turns.length).to.eql(4);
      });
    });

    describe("when only one worker has a move", function () {

      let board, placeAction, playerId0, worker0StartLoc
        , worker1StartLoc, worker0Id, worker1Id, gameState, tg, turns;
      /* Board:      Workers at:
        0 , 4 , 0 , 0     [0,0] and [0,2]
        4 , 4 , 4 , 4     */
      beforeEach(function () {
        board = new Board();
        playerId0 = 0;
        worker0StartLoc = [0,0];
        worker1StartLoc = [0,2];
        board.heights[0][0] = 0;
        board.heights[0][1] = 4;
        board.heights[0][2] = 0;
        board.heights[0][3] = 0;
        board.heights[1][0] = 4;
        board.heights[1][1] = 4;
        board.heights[1][2] = 4;
        board.heights[1][3] = 4;

        // Place worker at [0,0] for player 1
        gameState = new GameState(board);
        Action.execute(new PlaceAction(worker0StartLoc), gameState);
        // To flip the turn from player 2 back to player 1, place another worker
        // also tests that turns are only generated for the player whose turn it is
        Action.execute(new PlaceAction([5,5]), gameState);
        // Place worker at [0,2] for player 1
        Action.execute(new PlaceAction(worker1StartLoc), gameState);
        worker0Id = gameState.getWorkerList(playerId0)[0];
        worker1Id = gameState.getWorkerList(playerId0)[1];

        // Flip turn back to player 1's turn
        gameState.flipTurn();
        tg = new TurnGenerator(gameState);
        // generate all possible turns for player 1
        turns = [];
        while (tg.hasNext()) {
          turns.push(tg.next());
        }
      });

      it("only generates Turns for that worker, then stops", function () {
        expect(turns.length).to.eql(3);
        for (let turn of turns) {
          let moveLoc = turn[0].getLoc();
          expect(moveLoc).to.eql([0,3]);
          expect(turn[0].getWorkerId()).to.eql(worker1Id);
          expect(turn[1].getWorkerId()).to.eql(worker1Id);
        }
      });
    });


    describe("when neither worker has an available move", function () {
      let board, worker0StartLoc, worker1StartLoc, gameState, tg;
      /* Board:      Workers at:
        0 , 4 , 0 , 4     [0,0] and [0,2]
        4 , 4 , 4 , 4     */
      beforeEach(function () {
        board = new Board();
        worker0StartLoc = [0,0];
        worker1StartLoc = [0,2];
        board.heights[0][0] = 0;
        board.heights[0][1] = 4;
        board.heights[0][2] = 0;
        board.heights[0][3] = 4;
        board.heights[1][0] = 4;
        board.heights[1][1] = 4;
        board.heights[1][2] = 4;
        board.heights[1][3] = 4;

        // Place worker at [0,0] for player 1
        gameState = new GameState(board);
        Action.execute(new PlaceAction(worker0StartLoc), gameState);
        // To flip the turn from player 2 back to player 1, place another worker
        // also tests that turns are only generated for the player whose turn it is
        Action.execute(new PlaceAction([5,5]), gameState);
        // Place worker at [0,2] for player 1
        Action.execute(new PlaceAction(worker1StartLoc), gameState);

        // Flip turn back to player 1's turn
        gameState.flipTurn();
        tg = new TurnGenerator(gameState);
      });

      it("does not generate any Turns", function () {
        expect(tg.hasNext()).to.eql(false);
      });
    });

  });

  describe("when used, does not mutate the GameState it is constructed with", function () {
    let board, gameState, gsCopy, playerId0, playerId1, worker0StartLoc
      , worker1StartLoc, tg, turns;
    /* Board:      Workers at:
      0 , 0 , 0 , 4     [0,0] and [0,2]
      4 , 4 , 4 , 4     */
    beforeEach(function () {
      board = new Board();
      playerId0 = 0;
      playerId1 = 1;
      worker0StartLoc = [0,0];
      worker1StartLoc = [0,2];
      board.heights[0][0] = 0;
      board.heights[0][1] = 4;
      board.heights[0][2] = 0;
      board.heights[0][3] = 4;
      board.heights[1][0] = 4;
      board.heights[1][1] = 4;
      board.heights[1][2] = 4;
      board.heights[1][3] = 4;

      // Place worker at [0,0] for player 1
      gameState = new GameState(board);
      Action.execute(new PlaceAction(worker0StartLoc), gameState);
      // To flip the turn from player 2 back to player 1, place another worker
      // also tests that turns are only generated for the player whose turn it is
      Action.execute(new PlaceAction([5,5]), gameState);
      // Place worker at [0,2] for player 1
      Action.execute(new PlaceAction(worker1StartLoc), gameState);

      // Flip turn back to player 1's turn
      gameState.flipTurn();
      gsCopy = gameState.copy();
      tg = new TurnGenerator(gameState);
      while (tg.hasNext()) {
        turns.push(tg.next());
      }
    });

    it("does not mutate the GameState's board", function () {
      expect(gameState.getBoard()).to.eql(gsCopy.getBoard());
    });

    it("does not mutate the GameState's worker list", function () {
      expect(gameState.getWorkerList(playerId0)).to.eql(gsCopy.getWorkerList(playerId0));
      expect(gameState.getWorkerList(playerId1)).to.eql(gsCopy.getWorkerList(playerId1));
    });
  });
});