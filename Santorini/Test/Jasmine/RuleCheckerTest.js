const RuleChecker = require('../../Common/RuleChecker.js');
const Board = require('../../Common/Board.js');
const GameState = require('../../Common/GameState.js');
const Action = require('../../Common/Action.js');
const PlaceAction = Action.PlaceAction;
const MoveAction = Action.MoveAction;
const BuildAction = Action.BuildAction;

describe("RuleChecker", function () {
  let gameState;
  let board;
  describe("PlaceAction validation", function () {
    let action;
    beforeEach(function () {
      board = new Board();
      gameState = new GameState(board);
      action = new PlaceAction([1, 1]);
    });
    it("fails if no player ID is provided", function () {
      // not sure if validatePlaceAction should check if it's given a player ID
      // or just wait for the (gameState.getWhoseTurn() !== playerId) check to pass
      let valid = RuleChecker.validate(gameState, action);
      expect(valid).toBe(false);
    });
    it("fails if it's not the player's turn", function () {
      gameState.whoseTurn = 1;
      let valid = RuleChecker.validate(gameState, action, 0);
      expect(valid).toBe(false);
    });
    it("fails if the player has 2+ workers on the board already", function () {
      let place0 = new PlaceAction([0, 0]); // player 0
      let place1 = new PlaceAction([0, 1]); // player 1
      let place2 = new PlaceAction([0, 2]); // player 0
      Action.execute(place0, gameState);
      Action.execute(place1, gameState);
      Action.execute(place2, gameState);
      // player 0 now has two Workers on the board
      let valid = RuleChecker.validate(gameState, action, 0);
      expect(valid).toBe(false);
    });
    it("fails if the board has 4+ workers already", function () {
      let place0 = new PlaceAction([0, 0]); // player 0
      let place1 = new PlaceAction([0, 1]); // player 1
      let place2 = new PlaceAction([0, 2]); // player 0
      let place3 = new PlaceAction([0, 3]); // player 1
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
    it("fails if the destination isn't on the board", function () {
      let offTheBoard = new PlaceAction([board.BOARD_SIZE, board.BOARD_SIZE]);
      let valid = RuleChecker.validate(gameState, offTheBoard, 0);
      expect(valid).toBe(false);
    });
    it("fails if the destination is occupied by another worker", function () {
      let place0 = new PlaceAction([1, 1]); // player 0
      Action.execute(place0, gameState);
      // action places a Worker on [1,1], which is now occupied
      let valid = RuleChecker.validate(gameState, action, 1);
      expect(valid).toBe(false);
    });
    it("succeeds if the placement is completely valid", function () {
      expect(RuleChecker.validate(gameState, action, 0)).toBe(true);
    });
    describe("after validation is complete", function () {
      let initialGameState;
      let initialAction;
      beforeEach(function () {
        board = new Board();
        gameState = new GameState(board);
        let place0 = new PlaceAction([0, 0]);
        Action.execute(place0, gameState);

        action = new PlaceAction([1, 1]);
        initialGameState = gameState.copy();
        initialAction = Action.copy(action);
        // call validate here and check that no mutation occurs
        RuleChecker.validate(gameState, action, 0);
      });
      it("has not mutated the given GameState", function () {
        expect(gameState).toEqual(initialGameState);
      });
      it("has not mutated the given Action", function () {
        expect(action).toEqual(initialAction);
      });
    });
  });
  describe("MoveAction validation", function () {
    let action;
    let workerId;
    beforeEach(function () {
      board = new Board();
      gameState = new GameState(board);

      // player 0 has a Worker at [1,1]
      let place0 = new PlaceAction([1, 1]);
      Action.execute(place0, gameState);
      workerId = board.getWorkers().length - 1;
      action = new MoveAction(workerId, [1, 2]);
      gameState.whoseTurn = 0; // make it player 0's turn again
    });
    it("fails if the worker being moved doesn't belong to the player whose turn it is", function () {
      gameState.whoseTurn = 1;
      let valid = RuleChecker.validate(gameState, action);
      expect(valid).toBe(false);
    });
    it("fails if the player just moved a worker", function () {
      let firstMove = new MoveAction(workerId, [2, 2]);
      Action.execute(firstMove, gameState);
      let valid = RuleChecker.validate(gameState, action);
      expect(valid).toBe(false);
    });
    it("fails if the destination isn't on the board", function () {
      gameState.whoseTurn = 1;
      let place1 = new PlaceAction([0, 0]);
      Action.execute(place1, gameState, 1);
      // player 1 has a Worker at [0,0]
      gameState.flipTurn();
      let player1WorkerId = gameState.getWorkerList(1)[0];
      let offTheBoardMove = new MoveAction(player1WorkerId, [-1, 0]);
      let valid = RuleChecker.validate(gameState, offTheBoardMove);
      expect(valid).toBe(false);
    });
    it("fails if the destination is not adjacent", function () {
      action.loc = [3, 3];
      let valid = RuleChecker.validate(gameState, action);
      expect(valid).toBe(false);
    });
    it("fails if the destination is occupied by another worker", function () {
      gameState.whoseTurn = 1;
      let place1 = new PlaceAction([0, 0]);
      Action.execute(place1, gameState, 1);

      // player 1 now has a Worker at [0,0]
      action = new MoveAction(workerId, [0, 0]); // attempt to move onto [0,0]
      let valid = RuleChecker.validate(gameState, action);
      expect(valid).toBe(false);
    });
    it("fails if the destination is more than 1 higher than worker's current location", function () {
      board.heights[1][2] = 2;
      let valid = RuleChecker.validate(gameState, action);
      expect(valid).toBe(false);
    });
    it("fails if the destination is at the board's max height", function () {
      board.heights[1][2] = board.MAX_HEIGHT;
      board.heights[1][1] = board.MAX_HEIGHT - 1;
      let valid = RuleChecker.validate(gameState, action);
      expect(valid).toBe(false);
    });
    it("succeeds if the movement is completely valid", function () {
      let valid = RuleChecker.validate(gameState, action);
      expect(valid).toBe(true);
    });
    describe("after validation is complete", function () {
      let initialGameState;
      let initialAction;
      beforeEach(function () {
        // call validate in here and check lack of side effects
        // within the it()s below
        initialGameState = gameState.copy();
        initialAction = Action.copy(action);

        expect(RuleChecker.validate(gameState, action)).toBe(true);
      });
      it("has not mutated the given GameState", function () {
        expect(gameState).toEqual(initialGameState);
      });
      it("has not mutated the given Action", function () {
        expect(action).toEqual(initialAction);
      });
    });
  });
  describe("BuildAction validation,", function () {
    let buildAction;
    let valid;
    let p1Id = 0;
    let p2Id = 1;
    describe("when the worker doesn't belong to the player whose turn it is,", function () {
      beforeEach(function () {
        buildAction = jasmine.createSpyObj('action', {
          'getType': Action.BUILD,
          'getWorkerId': 3
        });
        gameState = jasmine.createSpyObj('gameState', {
          'getBoard': undefined,
          'getOwner': p2Id,
          'getWhoseTurn': p1Id
        });
        valid = RuleChecker.validate(gameState, buildAction);
      });
      it("fails", function () {
        expect(gameState.getOwner).toHaveBeenCalledTimes(1);
        expect(valid).toBe(false);
      });
    });

    describe("when the player just built,", function () {
      beforeEach(function () {
        buildAction = jasmine.createSpyObj('buildAction', {
          'getType': Action.BUILD,
          'getWorkerId': 3
        });
        board = jasmine.createSpyObj('board', ['getHeight']);
        gameState = jasmine.createSpyObj('gameState', {
          'getBoard': board,
          'getOwner': p1Id,
          'getWhoseTurn': p1Id,
          'getLastAction': buildAction
        });
        valid = RuleChecker.validate(gameState, buildAction);
      });
      it("fails", function () {
        expect(valid).toBe(false);
        expect(gameState.getLastAction).toHaveBeenCalledTimes(1);
      });
    });

    describe("when the player just placed a worker,", function () {
      beforeEach(function () {
        buildAction = jasmine.createSpyObj('buildAction', {
          'getType': Action.BUILD,
          'getWorkerId': 3
        });
        placeAction = jasmine.createSpyObj('placeAction', {
          'getType': Action.PLACE
        });
        board = jasmine.createSpyObj('board', ['getHeight']);
        gameState = jasmine.createSpyObj('gameState', {
          'getBoard': board,
          'getOwner': p1Id,
          'getWhoseTurn': p1Id,
          'getLastAction': placeAction
        });
        valid = RuleChecker.validate(gameState, buildAction);
      });
      it("fails", function () {
        expect(valid).toBe(false);
        expect(gameState.getLastAction).toHaveBeenCalledTimes(1);
        expect(placeAction.getType).toHaveBeenCalledTimes(1);
      });
    });

    describe("when the build location isn't adjacent to the worker,", function () {
      beforeEach(function () {
        buildAction = jasmine.createSpyObj('buildAction', {
          'getType': Action.BUILD,
          'getWorkerId': 3,
          'getLoc': [6, 6]
        });
        moveAction = jasmine.createSpyObj('moveAction', {
          'getType': Action.MOVE
        });
        board = jasmine.createSpyObj('board', {
          'getWorker': [0, 0]
        });
        gameState = jasmine.createSpyObj('gameState', {
          'getBoard': board,
          'getOwner': p1Id,
          'getWhoseTurn': p1Id,
          'getLastAction': moveAction
        });
        valid = RuleChecker.validate(gameState, buildAction);
      });
      it("fails", function () {
        expect(valid).toBe(false);
        expect(buildAction.getLoc).toHaveBeenCalledTimes(1);
        expect(board.getWorker).toHaveBeenCalledTimes(1);
      });
    });

    describe("when the build location is already height 4,", function () {
      beforeEach(function () {
        buildAction = jasmine.createSpyObj('buildAction', {
          'getType': Action.BUILD,
          'getWorkerId': 3,
          'getLoc': [0, 1]
        });
        moveAction = jasmine.createSpyObj('moveAction', {
          'getType': Action.MOVE
        });
        board = jasmine.createSpyObj('board', {
          'getWorker': [0, 0],
          'getHeight': 4
        });
        board.MAX_HEIGHT = 4;
        gameState = jasmine.createSpyObj('gameState', {
          'getBoard': board,
          'getOwner': p1Id,
          'getWhoseTurn': p1Id,
          'getLastAction': moveAction
        });
        valid = RuleChecker.validate(gameState, buildAction);
      });
      it("fails", function () {
        expect(valid).toBe(false);
        expect(board.getHeight).toHaveBeenCalledTimes(1);
      });
    });

    describe("when the build location is occupied or not on the board,", function () {
      beforeEach(function () {
        buildAction = jasmine.createSpyObj('buildAction', {
          'getType': Action.BUILD,
          'getWorkerId': 3,
          'getLoc': [-1, 1]
        });
        moveAction = jasmine.createSpyObj('moveAction', {
          'getType': Action.MOVE
        });
        board = jasmine.createSpyObj('board', {
          'getWorker': [0, 0],
          'getHeight': 3,
          'isValidUnoccupiedLoc': false
        });
        board.MAX_HEIGHT = 4;
        gameState = jasmine.createSpyObj('gameState', {
          'getBoard': board,
          'getOwner': p1Id,
          'getWhoseTurn': p1Id,
          'getLastAction': moveAction
        });
        valid = RuleChecker.validate(gameState, buildAction);
      });
      it("fails", function () {
        expect(valid).toBe(false);
        expect(board.isValidUnoccupiedLoc).toHaveBeenCalledTimes(1);
      });
    });

    describe("when the build action is completely valid,", function () {
      beforeEach(function () {
        buildAction = jasmine.createSpyObj('buildAction', {
          'getType': Action.BUILD,
          'getWorkerId': 3,
          'getLoc': [-1, 1]
        });
        moveAction = jasmine.createSpyObj('moveAction', {
          'getType': Action.MOVE
        });
        board = jasmine.createSpyObj('board', {
          'getWorker': [0, 0],
          'getHeight': 3,
          'isValidUnoccupiedLoc': true
        });
        board.MAX_HEIGHT = 4;
        gameState = jasmine.createSpyObj('gameState', {
          'getBoard': board,
          'getOwner': p1Id,
          'getWhoseTurn': p1Id,
          'getLastAction': moveAction
        });
        valid = RuleChecker.validate(gameState, buildAction);
      });
      it("succeeds", function () {
        expect(valid).toBe(true);
      });
    });
  });
  describe("isWinningLocation", function () {
    beforeEach(function () {
      board = new Board();
      gameState = new GameState(board);
      board.heights[0][0] = RuleChecker.WINNING_HEIGHT;
    });
    it("returns true when the height is a winning height", function () {
      expect(RuleChecker.isWinningLocation(gameState, [0, 0])).toBe(true);
    });
    it("returns false when the height is not a winning height", function () {
      expect(RuleChecker.isWinningLocation(gameState, [3, 4])).toBe(false);
    });
  });
});
