const Action = require('../../Common/Action.js');
const PlaceAction = Action.PlaceAction;
const MoveAction = Action.MoveAction;
const BuildAction = Action.BuildAction;
const GameState = require('../../Common/GameState.js');
const Board = require('../../Common/Board.js');

describe("Action test suite:", function() {
  describe("Data access functions (getters): ", function() {
    describe("PlaceAction", function() {
      let placeAction;
      beforeEach(function() {
        placeAction = new PlaceAction([0, 0]);
      });
      it("returns the proper type", function() {
        expect(placeAction.getType()).toBe(Action.PLACE);
      });
      it("returns the proper Location", function() {
        expect(placeAction.getLoc()).toEqual([0, 0]);
      });
    });
    describe("MoveAction", function() {
      let moveAction;
      beforeEach(function() {
        moveAction = new MoveAction(0, [0, 0]);
      });
      it("returns the proper type", function() {
        expect(moveAction.getType()).toBe(Action.MOVE);
      });
      it("returns the proper Location", function() {
        expect(moveAction.getLoc()).toEqual([0, 0]);
      });
      it("returns the proper WorkerId", function() {
        expect(moveAction.getWorkerId()).toBe(0);
      });
    });
    describe("BuildAction", function() {
      let buildAction;
      beforeEach(function() {
        buildAction = new BuildAction(0, [0, 0]);
      });
      it("returns the proper type", function() {
        expect(buildAction.getType()).toBe(Action.BUILD);
      });
      it("returns the proper Location", function() {
        expect(buildAction.getLoc()).toEqual([0, 0]);
      });
      it("returns the proper WorkerId", function() {
        expect(buildAction.getWorkerId()).toBe(0);
      });
    });
  });


  describe("Copy function: ", function() {
    describe("PlaceAction", function() {
      let placeAction;
      let copy;
      beforeEach(function() {
        placeAction = new PlaceAction([0, 0]);
        copy = Action.copy(placeAction);
      });
      it("returns an exact copy", function() {
        expect(copy.getType()).toBe(placeAction.getType());
        expect(copy.getLoc()).toEqual(placeAction.getLoc());
      });
      it("returns a new object", function() {
        expect(placeAction).toBe(placeAction);
        expect(placeAction).not.toBe(copy);
      });
    })
    describe("MoveAction", function() {
      let moveAction;
      let copy;
      beforeEach(function() {
        moveAction = new MoveAction(0, [0, 0]);
        copy =  Action.copy(moveAction);
      });
      it("returns an exact copy", function() {
        expect(copy.getType()).toBe(moveAction.getType());
        expect(copy.getLoc()).toEqual(moveAction.getLoc());
        expect(copy.getWorkerId()).toBe(moveAction.getWorkerId());
      });
      it("returns a new object", function() {
        expect(moveAction).toBe(moveAction);
        expect(moveAction).not.toBe(copy);
      });
    })
    describe("BuildAction", function() {
      let buildAction;
      let copy;
      beforeEach(function() {
        buildAction = new BuildAction(0, [0, 0]);
        copy = Action.copy(buildAction);
      });
      it("returns an exact copy", function() {
        expect(copy.getType()).toBe(buildAction.getType());
        expect(copy.getLoc()).toEqual(buildAction.getLoc());
        expect(copy.getWorkerId()).toBe(buildAction.getWorkerId());
      });
      it("returns a new object", function() {
        expect(buildAction).toBe(buildAction);
        expect(buildAction).not.toBe(copy);
      });
    })
  });

  // Specs for testing execute() for each Action: 
  // Mock board and game state, test that execute() results in
  // calling the proper functions on the board and gamestate
  // with the correct arguments, and that no other funcs were called
  describe("Execute function: ", function() {
    let gameState;
    let board;
    let playerId = 0;
    let workerId = 1;
    describe("PlaceAction", function() {
      let placeAction;
      beforeEach(function() {
        board = jasmine.createSpyObj('board', {
          'addWorker' : workerId
        });
        gameState = jasmine.createSpyObj('gameState', {
          'getBoard' : board,
          'getWhoseTurn' : playerId,
          'addOwnership' : undefined,
          'setLastAction' : undefined,
          'flipTurn' : undefined
        });

        placeAction = new PlaceAction([2, 2]);
        Action.execute(placeAction, gameState);
      });

      it("gets the board and adds a worker to the board", function() {
        expect(gameState.getBoard).toHaveBeenCalledTimes(1);
        expect(board.addWorker).toHaveBeenCalledTimes(1);
        expect(board.addWorker).toHaveBeenCalledWith(2, 2);
      });
      it("adds the new WorkerId to the GameState's ownerships", function() {
        expect(gameState.getWhoseTurn).toHaveBeenCalledTimes(1);
        expect(gameState.addOwnership).toHaveBeenCalledTimes(1);
        // addOwnership() was called with workerId=1 and playerId=0
        expect(gameState.addOwnership).toHaveBeenCalledWith(1, 0);
      });
      it("sets the last action on the GameState to (a copy of) this PlaceAction", function() {
        let action = gameState.setLastAction.calls.argsFor(0)[0];
        expect(action).toEqual(placeAction);
        expect(gameState.setLastAction).toHaveBeenCalledTimes(1);
      });
      it("changes whose turn it is", function() {
        expect(gameState.flipTurn).toHaveBeenCalledTimes(1);
      });
    });
    describe("MoveAction", function() {
      let moveAction;
      let workerId = 2;
      beforeEach(function() {
        board = jasmine.createSpyObj('board', ['moveWorker']);
        gameState = jasmine.createSpyObj('gameState', {
          'getBoard' : board,
          'setLastAction' : undefined,
          'flipTurn' : undefined
        });
        moveAction = new MoveAction(workerId, [3, 3]);
        Action.execute(moveAction, gameState);
      });
      it("moves the Worker to the specified location, and moves no other workers", function() {
        expect(gameState.getBoard).toHaveBeenCalledTimes(1);
        expect(board.moveWorker).toHaveBeenCalledTimes(1);
        expect(board.moveWorker).toHaveBeenCalledWith(2, 3, 3);
      });
      it("does not change whose turn it is", function() {
        expect(gameState.flipTurn).not.toHaveBeenCalled();
      });
      it("sets the last action on the GameState to this MoveAction", function() {
        let action = gameState.setLastAction.calls.argsFor(0)[0];
        expect(action).toEqual(moveAction);
        expect(gameState.setLastAction).toHaveBeenCalledTimes(1);
      });
    });
    describe("BuildAction", function() {
      let buildAction;
      let workerId = 2;
      beforeEach(function() {
        board = jasmine.createSpyObj('board', ['buildFloor']);
        gameState = jasmine.createSpyObj('gameState', {
          'getBoard' : board,
          'setLastAction' : undefined,
          'flipTurn' : undefined
        });
        buildAction = new BuildAction(workerId, [3, 3]);
        Action.execute(buildAction, gameState);
      });
      it("builds only on the specified spot", function() {
        expect(gameState.getBoard).toHaveBeenCalledTimes(1);
        expect(board.buildFloor).toHaveBeenCalledTimes(1);
        expect(board.buildFloor).toHaveBeenCalledWith(2, 3, 3);
      });
      it("changes whose turn it is", function() {
        expect(gameState.flipTurn).toHaveBeenCalledTimes(1);
      });
      it("sets the last action on the GameState to this BuildAction", function() {
        let action = gameState.setLastAction.calls.argsFor(0)[0];
        expect(action).toEqual(buildAction);
        expect(gameState.setLastAction).toHaveBeenCalledTimes(1);
      });
    });
  });
});
