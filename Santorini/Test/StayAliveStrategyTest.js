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
const Direction = require('./../Common/Direction.js');

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
    it("returns an available turn if depth is 0", function () {
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
    it("returns just a move if it is a winning move", function () {
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
    it("returns false if the opponent can win no matter the choice of turn by this player", function () {
      let opponentPlace = new PlaceAction([2, 3]);
      gameState.flipTurn();
      Action.execute(opponentPlace, gameState);

      // player is too far to prevent the opponent from climbing and winning here
      board.heights[1][3] = 3;
      board.heights[2][3] = 2;

      let turn = StayAliveStrategy.chooseTurn(gameState, 1);
      expect(turn).to.eql(false);
    });
    it("checks multiple levels deep for opponent victory", function () {
      let opponentPlace = new PlaceAction([3, 4]);
      gameState.flipTurn();
      Action.execute(opponentPlace, gameState);

      // worker is too far to prevent the opponent to climbing and winning here
      board.heights[1][4] = 3;
      board.heights[2][4] = 2;
      board.heights[3][4] = 1;

      let turn = StayAliveStrategy.chooseTurn(gameState, 4);
      expect(turn).to.eql(false);
    });
    it("picks the correct move to prevent opponent victory", function () {
      let opponentPlace = new PlaceAction([2, 2]);
      gameState.flipTurn();
      Action.execute(opponentPlace, gameState);

      board.heights[1][2] = 3;
      board.heights[2][2] = 2;

      let turn = StayAliveStrategy.chooseTurn(gameState, 2);
      expect(turn.length).to.eql(2);
      // player builds on available 3-height to prevent opponent victory
      expect(turn[1].getLoc()).to.eql([1, 2]);
    });
  });
  describe("canWin function", function () {
    let board, gameState, playerId0, playerId1, workerStartLoc;
    beforeEach(function () {
      board = new Board();
      workerStartLoc = [1, 1];
      let placeAction = new PlaceAction(workerStartLoc);
      playerId0 = 0;
      playerId1 = 1;
      gameState = new GameState(board);
      Action.execute(placeAction, gameState);
      gameState.flipTurn();
    });
    it("checks all directions for a possible win-move", function () {
      board.heights[1][1] = 2;
      let location = null;
      for (let dir of Direction.MOVEMENT_DIRECTIONS) {
        if (location !== null) {
          board.heights[location[0]][location[1]] = 0;
        }
        location = Direction.adjacentLocation(workerStartLoc, dir);
        board.heights[location[0]][location[1]] = 3;
        expect(StayAliveStrategy.canWin(gameState, 0)).to.eql(true);
      }
    });
    it("returns false if depth is 0 and no wins are possible", function () {
      expect(StayAliveStrategy.canWin(gameState, 0)).to.eql(false);
    });
    it("checks if the player can prevent an opponent from staying alive in one round", function () {
      let opponentPlace = new PlaceAction([0, 0]);
      gameState.flipTurn();
      Action.execute(opponentPlace, gameState);

      // worker must move to [0,1] and build on [1,1], blocking opponent
      board.heights[1][0] = 2;
      board.heights[1][1] = 1;
      board.heights[0][1] = 1;

      expect(StayAliveStrategy.canWin(gameState, 1)).to.eql(true);
    });
    it("checks if the player can prevent an opponent from staying alive in multiple rounds", function () {
      board.heights =
        [[2, 0, 1, 0, 2, 4],
          [4, 4, 2, 4, 4, 4],
          [0, 0, 1, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0]];
      board.workers[0] = [2, 2];

      let opponentPlace1 = new PlaceAction([0, 0]);
      gameState.whoseTurn = playerId1;
      Action.execute(opponentPlace1, gameState);
      gameState.whoseTurn = playerId1;
      let opponentPlace2 = new PlaceAction([0, 4]);
      Action.execute(opponentPlace2, gameState);
      gameState.whoseTurn = playerId0;

      // player 0 wins by blocking all possible moves by both workers
      expect(StayAliveStrategy.canWin(gameState, 3)).to.eql(true);
    });
    it("checks that the player cannot prevent an opponent from staying alive in multiple rounds", function () {
      let opponentPlace1 = new PlaceAction([0, 0]);
      gameState.whoseTurn = playerId1;
      Action.execute(opponentPlace1, gameState);
      gameState.whoseTurn = playerId0;

      expect(StayAliveStrategy.canWin(gameState, 4)).to.eql(false);
    });
  });
});