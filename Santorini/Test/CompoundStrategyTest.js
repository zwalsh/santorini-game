let expect = require('chai').expect;
let sinon = require('sinon');
const Board = require('./../Common/Board.js');
const GameState = require('./../Common/GameState.js');
const Action = require('./../Common/Action.js');
const PlaceAction = Action.PlaceAction;
const MoveAction = Action.MoveAction;
const BuildAction = Action.BuildAction;
const CompoundStrategy = require('../Player/CompoundStrategy.js');

describe("Compound strategy", function () {
  let board, gameState;
  beforeEach(function () {
    board = new Board();
    gameState = new GameState(board);
  });
  describe("when used to produce a worker placement", function () {
    let placementStrategyMock, chooseTurnStrategyMock,  compoundStrategy,
        placeAction;
    beforeEach(function () {
      placeAction = new PlaceAction([0,0]);
      placementStrategyMock = sinon.fake.returns(placeAction);
      chooseTurnStrategyMock = sinon.fake();
      compoundStrategy = new CompoundStrategy(placementStrategyMock, chooseTurnStrategyMock);
    });
    it("returns the Action given by the choosePlacement strategy", function () {
      let givenPlaceAction = compoundStrategy.nextPlacement(gameState);
      expect(givenPlaceAction).to.eql(placeAction);
    });
    it("does not call any methods on the chooseTurn strategy", function() {
      expect(chooseTurnStrategyMock.callCount).to.eql(0);
    });
  });
  describe("when used to produce a Turn", function () {
    let placementStrategyMock, chooseTurnStrategyMock,  compoundStrategy,
      workerId, moveAction, buildAction;
    beforeEach(function () {
      workerId = 0;
      moveAction = new MoveAction(workerId, [0,0]);
      buildAction = new BuildAction(workerId, [1,1]);
      placementStrategyMock = sinon.fake();
      chooseTurnStrategyMock = sinon.fake.returns([moveAction, buildAction]);
      compoundStrategy = new CompoundStrategy(placementStrategyMock, chooseTurnStrategyMock);
    });
    it("returns the Turn given by the chooseTurn strategy", function () {
      let givenTurn = compoundStrategy.nextTurn(gameState);
      expect(givenTurn[0]).to.eql(moveAction);
      expect(givenTurn[1]).to.eql(buildAction);
    });
    it("does not call any methods on the choosePlacement strategy", function() {
      expect(placementStrategyMock.callCount).to.eql(0);
    });
  });
});