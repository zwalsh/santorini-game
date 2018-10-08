const RuleChecker = require('./../Common/RuleChecker.js');
const Board = require('./../Common/Board.js');
const GameState = require('./../Common/GameState.js');
const Action = require('./../Common/Action.js');
const PlaceAction = Action.PlaceAction;
const MoveAction = Action.MoveAction;
const BuildAction = Action.BuildAction;

describe("RuleChecker", function() {
  let gameState;
  let board;
  describe("PlaceAction validation", function() {
    let action;
    beforeEach(function() {
      board = new Board();
      gameState = new GameState(board);
      action = new PlaceAction([1,1]);
    });
    it("fails if no player ID is provided", function() {
      // not sure if validatePlaceAction should check if it's given a player ID
      // or just wait for the (gameState.getWhoseTurn() !== playerId) check to pass
      let valid = RuleChecker.validate(gameState, action);
      expect(valid).toBe(false);
    });
    it("fails if it's not the player's turn", function() {
      gameState.whoseTurn = 1;
      let valid = RuleChecker.validate(gameState, action, 0);
      expect(valid).toBe(false);
    });
    it("fails if the player has 2+ workers on the board already", function() {
      let place0 = new PlaceAction([0,0]); // player 0
      let place1 = new PlaceAction([0,1]); // player 1
      let place2 = new PlaceAction([0,2]); // player 0
      Action.execute(place0, gameState);
      Action.execute(place1, gameState);
      Action.execute(place2, gameState);
      // player 0 now has two Workers on the board
      let valid = RuleChecker.validate(gameState, action, 0);
      expect(valid).toBe(false);
    });
    it("fails if the board has 4+ workers already", function() {
      let place0 = new PlaceAction([0,0]); // player 0
      let place1 = new PlaceAction([0,1]); // player 1
      let place2 = new PlaceAction([0,2]); // player 0
      let place3 = new PlaceAction([0,3]); // player 1
      Action.execute(place0, gameState);
      Action.execute(place1, gameState);
      Action.execute(place2, gameState);
      Action.execute(place3, gameState);
      // the board now contains four Workers
      // NOTE: this may not properly test the behavior here, as
      // the earlier check (for MAX_WORKERS_PER_PLAYER) will
      // return false first.
      let valid = RuleChecker.validate(gameState, action, 0);
      expect(valid).toBe(false);
    });
    it("fails if the destination isn't on the board", function() {
      let offTheBoard = new PlaceAction([board.BOARD_SIZE, board.BOARD_SIZE]);
      let valid = RuleChecker.validate(gameState, offTheBoard, 0);
      expect(valid).toBe(false);
    });
    it("fails if the destination is occupied by another worker", function() {
      let place0 = new PlaceAction([1,1]); // player 0
      Action.execute(place0, gameState);
      // action places a Worker on [1,1], which is now occupied
      let valid = RuleChecker.validate(gameState, action, 1);
      expect(valid).toBe(false);
    });
    it("succeeds if the placement is completely valid", function() {
      expect(RuleChecker.validate(gameState, action, 0)).toBe(true);
    });
    describe("after validation is complete", function() {
      let initialHeights;
      let initialWorkers;
      let initialWorkerList0;
      let initialWorkerList1;
      let initialTurn;
      let initialLastAction;
      beforeEach(function() {
        board = new Board();
        gameState = new GameState(board);
        let place0 = new PlaceAction([0,0]);
        Action.execute(place0, gameState);

        initialHeights = board.getHeights();
        initialWorkers = board.getWorkers();
        initialWorkerList0 = gameState.getWorkerList(0);
        initialWorkerList1 = gameState.getWorkerList(1);
        initialTurn = gameState.getWhoseTurn();
        initialLastAction = gameState.getLastAction();

        // call validate here and check that no mutation occurs
        action = new PlaceAction([1,1]);
        RuleChecker.validate(gameState, action, 0);
      });
      it("has not mutated the given GameState", function() {
        expect(gameState.getBoard().getHeights()).toEqual(initialHeights);
        expect(gameState.getBoard().getWorkers()).toEqual(initialWorkers);
        expect(gameState.getWhoseTurn()).toEqual(initialTurn);
        expect(gameState.getLastAction()).toEqual(initialLastAction);
        expect(gameState.getWorkerList(0)).toEqual(initialWorkerList0);
        expect(gameState.getWorkerList(1)).toEqual(initialWorkerList1);
      });
      it("has not mutated the given Action", function() {
        expect(action.getType()).toBe("place");
        expect(action.getLoc()).toEqual([1,1]);
      });
    });
  });

  describe("MoveAction validation", function() {
    let action;
    let workerId;
    beforeEach(function() {
      board = new Board();
      gameState = new GameState(board);

      // player 0 has a Worker at [1,1]
      let place0 = new PlaceAction([1,1]);
      Action.execute(place0, gameState);
      workerId = board.getWorkers()[0];
      action = new MoveAction(workerId, [1,2]);
      gameState.flipTurn(); // make it player 0's turn again
    });
    it("fails if the worker being moved doesn't belong to the player whose turn it is", function() {
      gameState.whoseTurn = 1;
      let valid = RuleChecker.validate(gameState, action);
      expect(valid).toBe(false);
    });
    it("fails if the player just moved a worker", function() {
      let firstMove = new MoveAction(workerId, [2,2]);
      Action.execute(firstMove, gameState);
      let valid = RuleChecker.validate(gameState, action);
      expect(valid).toBe(false);
    });
    it("fails if the destination isn't on the board", function() {
      let place1 = new PlaceAction([0,0]);
      Action.execute(place1, gameState, 1);
      // player 1 has a Worker at [0,0]
      gameState.flipTurn();
      let player1WorkerId = gameState.getWorkerList(1)[0];
      let offTheBoardMove = new MoveAction(player1WorkerId, [-1,0]);
      let valid = RuleChecker.validate(gameState, offTheBoardMove);
      expect(valid).toBe(false);
    });
    it("fails if the destination is occupied by another worker", function() {
      let place1 = new PlaceAction([0,0]);
      Action.execute(place1, gameState, 1);
      // player 1 now has a Worker at [0,0]
      action = new MoveAction(workerId, [0,0]); // attempt to move onto [0,0]
      let valid = RuleChecker.validate(gameState, action);
      expect(valid).toBe(false);
    });
    it("fails if the destination is more than 1 higher than worker's current location", function() {
      board.heights[1][2] = 2;
      let valid = RuleChecker.validate(gameState, action);
      expect(valid).toBe(false);
    });
    it("succeeds if the movement is completely valid", function() {
      gameState.flipTurn();
      let valid = RuleChecker.validate(gameState, action);
      expect(valid).toBe(true);
    });
    describe("after validation is complete", function() {
      beforeEach(function() {
        board = new Board();
        gameState = new GameState(board);
        // call validate in here and check lack of side effects
        // within the it()s below
      });
      it("has not mutated the given GameStaten", function() {

      });
      it("has not mutated the given Action", function() {

      });
    });
  });

  describe("BuildAction validation", function() {
    let action;
    beforeEach(function() {
      board = new Board();
      gameState = new GameState(board);
    });
    it("fails if the worker building doesn't belong to the player whose turn it is", function() {

    });
    it("fails if the player just built", function() {

    });
    it("fails if the player just placed a worker", function() {

    });
    it("fails if the build location isn't on the board", function() {

    });
    it("fails if the build location is occupied by another worker", function() {

    });
    it("fails if the build location is already height 4", function() {

    });

    it("succeeds if the build is completely valid", function() {

    });
    describe("after validation is complete", function() {
      beforeEach(function() {
        board = new Board();
        gameState = new GameState(board);
        // call validate in here and check lack of side effects
        // within the it()s below
      });
      it("has not mutated the given GameStaten", function() {

      });
      it("has not mutated the given Action", function() {

      });
    });
  });

});
