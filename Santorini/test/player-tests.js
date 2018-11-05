/*
    Test suite for the Player implementation that uses a Strategy.
 */
let chai = require('chai');
let sinon = require('sinon');
let Player = require('../Player/player');
let Board = require('../Common/board');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Player', function () {
  let player, player1Name, player2Name;
  let mockStrategy;
  let initWorker, board, placeRequest, turn;
  beforeEach(function () {
    player1Name = "wayne";
    player2Name = "garth";
    player = new Player(player1Name);

    initWorker = {player: player1Name, x:0, y:0};
    placeRequest = ["place", 1, 1];

    board = new Board([initWorker]);
    turn = [["move", 1, ["EAST", "PUT"]], ["build", ["EAST", "PUT"]]];

    mockStrategy = {
      getNextWorkerPlace: sinon.stub().withArgs([initWorker]).returns(placeRequest),
      getNextTurn: sinon.stub().withArgs(board).returns(turn),
    };
    player.strategy = mockStrategy;
  });

  describe('getPlacement', function () {
    it('calls the strategy and returns its value', function () {
      let result = player.placeInitialWorker([initWorker]);
      expect(mockStrategy.getNextWorkerPlace.called).to.eql(true);
      expect(result).to.eventually.eql(placeRequest);
    });
  });
  describe('getTurn', function () {
    it('calls the strategy and returns its value', function () {
      let result = player.takeTurn(board);
      expect(mockStrategy.getNextTurn.called).to.eql(true);
      expect(result).to.eventually.eql(turn);
    });
  });
});
