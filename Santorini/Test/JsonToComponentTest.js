let expect = require('chai').expect;
const JsonParser = require('./../Lib/JsonParse.js');
const JsonToComponent = require('./../Lib/JsonToComponent.js');

describe("Creation of a GameState", function () {
  it("properly initializes heights", function () {
    let input = JsonParser.parseInputString("[[1,1,1,2,2,2],[1,2,3,1,2,3]]")[0];
    let expectedRow0 = [1, 1, 1, 2, 2, 2];
    let expectedRow1 = [1, 2, 3, 1, 2, 3];
    let expectedRestRows = [0, 0, 0, 0, 0, 0];
    let board = JsonToComponent.createGameState(input)[0].getBoard();
    let heights = board.getHeights();
    expect(heights[0]).to.eql(expectedRow0);
    expect(heights[1]).to.eql(expectedRow1);
    for (let rowIdx = 2; rowIdx < heights.length; rowIdx++) {
      expect(heights[rowIdx]).to.eql(expectedRestRows);
    }
  });
  it("pads out rows with zeroes", function () {
    let input = [[1, 2]];
    let board = JsonToComponent.createGameState(input)[0].getBoard();
    expect(board.getHeights()[0]).to.eql([1, 2, 0, 0, 0, 0]);
  });
  it("places workers on the board", function () {
    let input = [[], [3, "1a1"]];
    let board = JsonToComponent.createGameState(input)[0].getBoard();
    expect(board.getWorkers()[0]).to.eql([1, 1]);
  });
  it("places workers for multiple players", function () {
    let input = [["2a1", "2b1"]];
    let board = JsonToComponent.createGameState(input)[0].getBoard();
    expect(board.getWorkers()[0]).to.eql([0, 0]);
    expect(board.getWorkers()[1]).to.eql([0, 1]);
  });
  it("places multiple workers for multiple players", function () {
    let input = [["0a1", "0a2", "1b1", "1b2"]];
    let board = JsonToComponent.createGameState(input)[0].getBoard();
    let workers = board.getWorkers();
    expect(workers[0]).to.eql([0, 0]);
    expect(workers[1]).to.eql([0, 1]);
    expect(workers[2]).to.eql([0, 2]);
    expect(workers[3]).to.eql([0, 3]);
  });
  it("adds all workers to the name->id map", function () {
    let input = [["0a1", "0a2", "1b1", "1b2"]];
    let workerMap = JsonToComponent.createGameState(input)[1];
    expect(workerMap.get("a1")).to.eql(0);
    expect(workerMap.get("a2")).to.eql(1);
    expect(workerMap.get("b1")).to.eql(2);
    expect(workerMap.get("b2")).to.eql(3);
  });
});
describe("createMoveAction", function () {
  let gameState;
  let workerNameToId;
  let moveAction;
  beforeEach(function () {
    let input = [["0a1", "0a2", "1b1", "1b2"],
      [1, 1, 1, 1]];
    let createdGame = JsonToComponent.createGameState(input);
    gameState = createdGame[0];
    workerNameToId = createdGame[1];
    moveAction = JsonToComponent.createMoveAction(["move", "b1", ["PUT", "SOUTH"]],
      workerNameToId, gameState);
  });
  it("uses the correct WorkerId", function () {
    expect(moveAction.getWorkerId()).to.eql(2);
  });
  it("uses the correct location", function () {
    expect(moveAction.getLoc()).to.eql([1, 2]);
  });
  it("creates the correct type of Action", function () {
    expect(moveAction.getType()).to.eql("move");
  });
  it("updates the whoseTurn field of the GameState", function () {
    expect(gameState.whoseTurn).to.eql(1);
  });
});
