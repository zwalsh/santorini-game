let assert = require('chai').assert;
let sinon = require('sinon');
let Referee = require('../Admin/referee');
let Rulechecker = require('../Common/rulechecker');
let Worker = require('../Common/worker');
let Board = require('../Common/board');
let c = require('../Lib/constants');

describe('Referee', function () {

  describe('Game playing methods', function () {

    describe('playGame', function () {
      let board, referee, p1, p2, w11, w12, w21, w22;
      let p1Name = "wayne";
      let p2Name = "garth";
      beforeEach(function () {
        let grid = [[2, 3, 0, 0, 0, 0],
          [3, 3, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0]];

        w11 = new Worker(0, 0, 1, p1Name);
        w12 = new Worker(4, 0, 2, p1Name);
        w21 = new Worker(5, 0, 1, p2Name);
        w22 = new Worker(6, 0, 2, p2Name);
        let workerList = [w11, w12, w21, w22];

        board = new Board(null, grid, workerList);


      });
      it('notifies both Players of the game start and opponent name');
      describe('when neither Player provides an invalid Turn', function () {
        let gameResult;
        beforeEach(function () {
          let endGameReason = [p1Name, c.EndGameReason.WON];
          let p2Turn = [["move", {player:p2Name, id:1}, ["PUT", "SOUTH"]], ["build", ["PUT", "SOUTH"]]];
          p2 = {
            name: p2Name,
            takeTurn: sinon.stub().withArgs(board).returns(p2Turn),
            notifyGameOver: sinon.stub().withArgs(endGameReason),
            newGame: sinon.stub().withArgs(p1Name)
          };

          let boardAfterP2Turn = board.copy();
          boardAfterP2Turn.applyTurn(p2Turn);

          let p1Turn = [["move", {player:p1Name, id:1}, ["EAST", "PUT"]]];
          p1 = {
            name: p1Name,
            takeTurn: sinon.stub().withArgs(boardAfterP2Turn).returns(p1Turn),
            notifyGameOver: sinon.stub().withArgs(endGameReason),
            newGame: sinon.stub().withArgs(p2Name)
          };
          referee = new Referee(p2, p1);
          referee.board = board;
          referee.setup = sinon.stub().returns(c.GameState.IN_PROGRESS);
          gameResult = referee.playGame();
        });
        it('requests Turns from both', function () {
          assert.deepEqual(gameResult, [p1Name, c.EndGameReason.WON]);
          assert.isTrue(p1.takeTurn.calledOnce);
          assert.isTrue(p2.takeTurn.calledOnce);
        });
        it('notifies both Players that the winning Player won');
      });
      describe('when a Player provides an invalid Turn', function () {
        it('notifies both Players that the non-rule-breaking Player won');
      });
    });

    describe('playNGames', function () {
      describe('when neither Player provides an invalid Turn', function () {
        it('plays the specified number of Games');
        it('returns the correct GameResult set');
      });
      describe('when a Player provides an invalid Turn', function () {
        it('terminates that game and does not play any more games');
        it('returns the correct GameResult set');
      });
    });

    describe('setup', function () {
      describe('when a Player provides an invalid PlaceRequest', function () {
        it('returns a GameState indicating that the other Player won');
        it('does not create a new Board for the Referee');
      });
      describe('when both Players provide valid PlaceRequests', function () {
        it('requests two PlaceRequests from each Player');
        it('creates a Board with all four workers correctly added to the Referee\'s Board');
        it('returns a GameState indicating that the game should continue');
      });
    });

    describe('getAndApplyTurn', function () {
      describe('when the Player provides a valid non-winning Turn', function () {
        it('applies the player\'s turn to the Board');
        it('returns a GameState indicating that the game should continue');
      });
      describe('when the Player provides a valid winning Turn', function () {
        it('applies the player\'s turn to the Board');
        it('returns a GameState indicating that the Player has won the game');
      })
      describe('when the Player provides an invalid Turn', function () {
        it('does not apply the Turn to the Board');
        it('returns a GameState indicating that the other Player won');
      });
    });

    describe('checkPlaceReq', function () {
      it('rejects a PlaceRequest if it is improperly formed');
      it('rejects a PlaceRequest that is not valid');
      it('accepts a properly formed, valid PlaceRequest');
    });

    describe('checkTurn', function () {
      it('rejects a Turn if it is improperly formed');
      it('rejects a Turn where the WorkerRequest does not match the player');
      it('rejects a Turn that is not valid');
      it('accepts a properly formed, correct-player-referencing, valid Turn');
    });

    describe('flip', function () {
      it('returns the opposite player');
    });
  });


  describe('Data checking methods', function () {
    describe('isWellFormedTurn', function () {
      describe('rejects improperly formed Turn when', function () {
        it('is not an Array', function () {
          let turn = {};
          assert.isFalse(Referee.isWellFormedTurn(turn));
        });
        it('is too short', function () {
          let turn = [];
          assert.isFalse(Referee.isWellFormedTurn(turn));
        });
        it('has an improperly formed move', function () {
          let turn = [["move"]];
          assert.isFalse(Referee.isWellFormedTurn(turn));
        });
        it('has an invalid build', function () {
          let turn = [["move", {player:"wayne", id:1}, ["PUT", "SOUTH"]], ["build"]];
          assert.isFalse(Referee.isWellFormedTurn(turn));
        });
      });
      it('accepts properly formed Turn', function () {
        let turn = [["move", {player:"bar", id:1}, ["PUT", "SOUTH"]], ["build", ["PUT", "SOUTH"]]];
        assert.isTrue(Referee.isWellFormedTurn(turn));
      });
    });

    describe('isWellFormedPlaceReq', function () {
      it('rejects improperly formed PlaceRequest');
      it('accepts properly formed PlaceRequest');
    });

    describe('isWellFormedMoveReq', function () {
      it('rejects improperly formed MoveRequest');
      it('accepts properly formed MoveRequest');
    });

    describe('isWellFormedBuildReq', function () {
      it('rejects improperly formed BuildRequest');
      it('accepts properly formed BuildRequest');
    });

    describe('isWellFormedWorkerReq', function () {
      it('rejects improperly formed WorkerRequest');
      it('accepts properly formed WorkerRequest');
    });
  });
});