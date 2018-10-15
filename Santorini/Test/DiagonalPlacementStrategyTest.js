let expect = require('chai').expect;
const Board = require('./../Common/Board.js');
const GameState = require('./../Common/GameState.js');
const Action = require('./../Common/Action.js');
const PlaceAction = Action.PlaceAction;
const DiagonalPlacementStrategy = require('./../Common/DiagonalPlacementStrategy.js');

describe("Diagonal placement strategy", function () {
  let board, gameState;
  beforeEach(function () {
    board = new Board();
    gameState = new GameState(board);
  });
  describe("when the board is empty", function () {
    it("places the worker at [0,0]", function () {
      expect(DiagonalPlacementStrategy.choosePlacement(gameState).getLoc()).to.eql([0, 0]);
    });
  });
  describe("when the board has a worker not on the diagonal", function () {
    beforeEach(function () {
      let placeAction = new PlaceAction([0, 1]);
      Action.execute(placeAction, gameState);
    });
    it("places the worker at [0,0]", function () {
      expect(DiagonalPlacementStrategy.choosePlacement(gameState).getLoc()).to.eql([0, 0]);
    });
  });
  describe("when there are workers on the diagonal", function () {
    beforeEach(function () {
      let place = new PlaceAction([0, 0]);
      Action.execute(place, gameState);
      place = new PlaceAction([1, 1]);
      Action.execute(place, gameState);
    });
    it("chooses the first empty diagonal", function () {
      expect(DiagonalPlacementStrategy.choosePlacement(gameState).getLoc()).to.eql([2, 2]);
    });
    it("ignores workers farther along the diagonal", function () {
      let place = new PlaceAction([3, 3]);
      expect(DiagonalPlacementStrategy.choosePlacement(gameState).getLoc()).to.eql([2, 2]);
    });
  });
});