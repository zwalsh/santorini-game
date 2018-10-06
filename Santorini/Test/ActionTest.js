const Action = require('./../Common/Action.js');
const PlaceAction = Action.PlaceAction;
const MoveAction = Action.MoveAction;
const BuildAction = Action.BuildAction;
const GameState = require('./../Common/GameState.js');

describe("action tests", function() {
  describe("data access", function() {
    describe("PlaceAction", function() {
      let placeAction;
      beforeEach(function() {
        placeAction = new PlaceAction([0, 0]);
      });
      it("returns the proper type", function() {

      });
      it("returns the proper Location", function() {

      });
    });
    describe("MoveAction", function() {
      let moveAction;
      beforeEach(function() {
        moveAction = new MoveAction(0, [0, 0]);
      });
      it("returns the proper type", function() {

      });
      it("returns the proper Location", function() {

      });
      it("returns the proper WorkerId", function() {

      });
    });
    describe("BuildAction", function() {
      let buildAction;
      beforeEach(function() {
        buildAction = new BuildAction(0, [0, 0]);
      });
      it("returns the proper type", function() {

      });
      it("returns the proper Location", function() {

      });
      it("returns the proper WorkerId", function() {

      });
    });
  });
  describe("copy operation", function() {
    describe("PlaceAction", function() {
      it("returns an exact copy", function() {

      });
      it("returns a new object", function() {

      });
    })
    describe("MoveAction", function() {
      it("returns an exact copy", function() {

      });
      it("returns a new object", function() {

      });
    })
    describe("BuildAction", function() {
      it("returns an exact copy", function() {

      });
      it("returns a new object", function() {

      });
    })
  });
  describe("execute operation", function() {
    let gameState;
    let board;
    beforeEach(function() {
      board = new Board();
      gameState = new GameState(board);
    });
    describe("PlaceAction", function() {
      let placeAction;
      beforeEach(function() {
        placeAction = new PlaceAction([2, 2]);
      });
      it("adds the new WorkerId to the GameState's ownerships", function() {

      });
      it("sets the last action on the GameState to this PlaceAction", function() {

      });
      it("changes whose turn it is", function() {

      });
      it("adds the Worker to the Board at the correct x/y", function() {

      });
    });
    describe("MoveAction", function() {
      let moveAction;
      beforeEach(function() {
        let workerId = board.addWorker(2,2);
        gameState.addOwnership(workerId, 0);
        moveAction = new MoveAction(workerId, [3, 3]);
      });
      it("moves the Worker to the specified spot", function() {

      });
      it("does not move any other Worker on the Board", function() {

      });
      it("does not change whose turn it is", function() {

      });
      it("sets the last action on the GameState to this MoveAction", function() {

      });
    });
    describe("BuildAction", function() {
      let buildAction;
      beforeEach(function() {
        let workerId = board.addWorker(2,2);
        gameState.addOwnership(workerId, 0);
        buildAction = new BuildAction(workerId, [3, 3]);
      });
      it("builds on the specified spot", function() {

      });
      it("does not change any other height on the Board", function() {

      });
      it("sets the last action on the GameState to this MoveAction", function() {

      });
      it("sets the last action on the GameState to this BuildAction", function() {

      });
    });
  });
});
