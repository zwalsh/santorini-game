/*
  Test suite for the StayAliveStrategy. Checks that the Strategy appropriately
  returns a turn when one is safe, and properly determines when a player
  can win the game.
 */
let expect = require('chai').expect
const StayAliveStrategy = require('./../Common/StayAliveStrategy.js');
const Board = require('./../Common/Board.js');
const GameState = require('./../Common/GameState.js');
const Action = require('./../Common/Action.js');
const PlaceAction = Action.PlaceAction;

describe("StayAliveStrategy", function () {
  describe("chooseTurn function", function () {
    let board, gameState, playerId0, playerId1, workerStartLoc;
    beforeEach(function () {
      board = new Board();
      workerStartLoc = [0, 0];
      let placeAction = new PlaceAction(workerStartLoc);
      playerId0 = 0;
      playerId1 = 1;
      gameState = new GameState(board);
      Action.execute(placeAction, gameState);
      gameState.flipTurn();
    });
    it("returns an available move if depth is 0", function () {
      let turn = StayAliveStrategy.chooseTurn(gameState, 0);
      expect(turn).to.not.eql(false);
    });
    it("returns false when the player cannot take any moves", function () {
      board.heights[1][0] = 4;
      board.heights[1][1] = 4;
      board.heights[0][1] = 4;
      let turn = StayAliveStrategy.chooseTurn(gameState, 0);
      expect(turn).to.eql(false);
    });
    it("returns a move if it is a winning move", function () {
      board.heights[0][0] = 2;
      board.heights[0][1] = 3;
      board.heights[1][0] = 4;
      board.heights[1][1] = 4;
      let turn = StayAliveStrategy.chooseTurn(gameState, 1);
      expect(turn).to.not.eql(false);
      expect(turn.length).to.eql(1);
      let moveAction = turn[0];
      expect(moveAction.getType()).to.eql(Action.MOVE);
      expect(moveAction.getLoc()).to.eql([0, 1]);
    });
    it("returns false if the opponent can win no matter the choice", function () {

    });
  });

  describe("canWin function", function () {

  });
});