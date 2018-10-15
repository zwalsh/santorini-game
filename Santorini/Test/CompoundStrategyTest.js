let expect = require('chai').expect;
const Board = require('./../Common/Board.js');
const GameState = require('./../Common/GameState.js');
const Action = require('./../Common/Action.js');
const PlaceAction = Action.PlaceAction;
const CompoundStrategy = require('../Player/CompoundStrategy.js');

describe("Compound strategy", function () {
  let board, gameState;
  beforeEach(function () {
    board = new Board();
    gameState = new GameState(board);
  });
  describe("before all Workers have been placed", function () {
    it("returns the Action given by the choosePlacement strategy", function () {
      
    });
  });
  describe("after all Workers have been placed", function () {
    it("calls the chooseTurn strategy to get a Turn", function () {

    });
    it("uses the Actions of that Turn one-by-one", function () {

    });
  });
});