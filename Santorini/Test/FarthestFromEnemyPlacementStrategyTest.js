let expect = require('chai').expect;
const Board = require('./../Common/Board.js');
const GameState = require('./../Common/GameState.js');
const Action = require('./../Common/Action.js');
const PlaceAction = Action.PlaceAction;
const FarthestFromEnemyPlacementStrategy = require('../Player/FarthestFromEnemyPlacementStrategy.js');

describe("Farthest from enemy placement strategy", function () {
  let board, gameState, size;
  beforeEach(function () {
    board = new Board();
    gameState = new GameState(board);
    size = board.getSize();
  });
  describe("when the board is empty", function () {
    it("places the worker at [0,0]", function () {
      let placeAction = FarthestFromEnemyPlacementStrategy.choosePlacement(gameState);
      expect(placeAction.getLoc()).to.eql([0, 0]);
    });
  });
  describe("when there is one opponent on the board", function () {
    describe("in a corner", function () {
      beforeEach(function () {
        let placeAction = new PlaceAction([0, size - 1]);
        Action.execute(placeAction, gameState);
      });
      it("places the worker in the opposite corner", function () {
        let placeAction = FarthestFromEnemyPlacementStrategy.choosePlacement(gameState);
        expect(placeAction.getLoc()).to.eql([size - 1, 0]);
      });
    });
    describe("somewhere in the middle", function () {
      beforeEach(function () {
        let placeAction = new PlaceAction([4, 2]);
        Action.execute(placeAction, gameState);
      });
      it("places the worker in the farthest corner", function () {
        let placeAction = FarthestFromEnemyPlacementStrategy.choosePlacement(gameState);
        expect(placeAction.getLoc()).to.eql([0, size - 1]);
      });
    });
    describe("and one worker in the farthest location", function () {
      beforeEach(function () {
        let placeAction = new PlaceAction([0, 0]);
        Action.execute(placeAction, gameState);
        placeAction = new PlaceAction([size - 1, size - 1]);
        Action.execute(placeAction, gameState);
      });
      it("places the worker in the farthest open location", function () {
        let placeAction = FarthestFromEnemyPlacementStrategy.choosePlacement(gameState);
        expect(placeAction.getLoc()).to.eql([0, 1]);
      });
    });
  });
  describe("when there are two opponents on the board", function () {
    beforeEach(function () {
      let place = new PlaceAction([0, 0]);
      Action.execute(place, gameState);
      gameState.flipTurn();
      place = new PlaceAction([size - 1, 0]);
      Action.execute(place, gameState);
    });
    it("places the worker farthest from the closest", function () {
      let placeAction = FarthestFromEnemyPlacementStrategy.choosePlacement(gameState);
      expect(placeAction.getLoc()).to.eql([2, size - 1]);
    });
    it("places the worker in an empty location", function () {
      let place = new PlaceAction([2, size - 1]);
      Action.execute(place, gameState);
      gameState.flipTurn();
      let placeAction = FarthestFromEnemyPlacementStrategy.choosePlacement(gameState);
      expect(placeAction.getLoc()).to.eql([3, size - 1]);
    });
  });
});
