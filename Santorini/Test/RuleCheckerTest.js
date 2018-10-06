const RuleChecker = require('./../Common/RuleChecker.js');

describe("RuleChecker", function() {
  let gameState;
  let board;
  describe("PlaceAction validation", function() {
    let action;
    beforeEach(function() {
      board = new Board();
      gameState = new GameState(board);
    });
    it("fails if no player ID is provided", function() {
      // not sure if validatePlaceAction should check if it's given a player ID
      // or just wait for the (gameState.getWhoseTurn() !== playerId) check to pass
    });
    it("fails if it's not the player's turn", function() {

    });
    it("fails if the player has 2+ workers on the board already", function() {

    });
    it("fails if the board has 4+ workers already", function() {

    });
    it("fails if the destination isn't on the board", function() {

    });
    it("fails if the destination is occupied by another worker", function() {

    });
    it("succeeds if the placement is completely valid", function() {

    });
    describe("after validation is complete", function() {
      beforeEach(function() {
        board = new Board();
        gameState = new GameState(board);
        action = new PlaceAction([0,0]);
        RuleChecker.validate();
        // call validate in here and check lack of side effects
        // within the it()s below
      });
      it("has not mutated the given GameStaten", function() {
  
      });
      it("has not mutated the given Action", function() {
  
      });
    });
  });

  describe("MoveAction validation", function() {
    let action;
    beforeEach(function() {
      board = new Board();
      gameState = new GameState(board);
    });
    it("fails if the worker being moved doesn't belong to the player whose turn it is", function() {

    });
    it("fails if the player just moved a worker", function() {

    });
    it("fails if the destination isn't on the board", function() {

    });
    it("fails if the destination is occupied by another worker", function() {

    });
    it("fails if the destination is more than 1 higher than worker's current location", function() {

    });
    it("succeeds if the movement is completely valid", function() {

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