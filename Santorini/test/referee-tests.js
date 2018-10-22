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

    describe('checkPlaceReq', function () {
      it('rejects a PlaceRequest if it is improperly formed');
      it('rejects a PlaceRequest that is not valid');
      it('accepts a properly formed, valid PlaceRequest');
    });

    describe('Turn-related functionality', function () {
      let player1, player2, p1Name, p2Name, workerId1, referee;
      beforeEach(function () {
        workerId1 = 1;
        p1Name = "Wayne";
        p2Name = "Garth";
        player1 = { name: p1Name, strategy: null };
        player2 = { name: p2Name, strategy: null };
        referee = new Referee(player1, player2);

        // Create a Board with the following heights, one Player1 worker
        // in the top left corner, and one Player2 worker in the top right corner.
        let heights = [[2, 3, 0, 0, 0, 0],
                      [2, 3, 0, 0, 0, 0],
                      [0, 0, 0, 0, 0, 0],
                      [0, 0, 0, 0, 0, 0],
                      [0, 0, 0, 0, 0, 0],
                      [0, 0, 0, 0, 0, 0]];
        let worker1 = new Worker(0,0,workerId1,p1Name);
        let worker2 = new Worker(5,0,workerId1,p2Name);
        let board = new Board(null, heights, [worker1, worker2]);
        referee.board = board;
      });
      describe('getAndApplyTurn', function () {
        let turn, gameState;
        describe('when the Player provides a valid non-winning Turn', function () {
          beforeEach(function () {
            turn = [["move", { player:p1Name, id:workerId1 }, ["PUT", "SOUTH"]],
              ["build", ["PUT", "SOUTH"]]];
            player1.takeTurn = sinon.stub().returns(turn);
            gameState = referee.getAndApplyTurn(player1);
          });
          it('applies the player"s turn to the Board', function () {
            let worker = referee.board.findWorker({player:p1Name,id:workerId1});
            assert.equal(worker.posn.x, 0);
            assert.equal(worker.posn.y, 1);
            assert.equal(referee.board.heightAtTile(0,2), 1);
          });
          it('returns a GameState indicating that the game should continue', function () {
            assert.deepEqual(gameState, c.GameState.IN_PROGRESS);
          });
        });
        describe('when the Player provides a valid winning Turn', function () {
          beforeEach(function () {
            turn = [["move", { player:p1Name, id:workerId1 }, ["EAST", "SOUTH"]]];
            player1.takeTurn = sinon.stub().returns(turn);
            gameState = referee.getAndApplyTurn(player1);
          });
          it('applies the player"s turn to the Board', function () {
            // show that the worker moved to the expected location
            let worker = referee.board.findWorker({player:p1Name,id:workerId1});
            assert.equal(worker.posn.x, 1);
            assert.equal(worker.posn.y, 1);
          });
          it('returns a GameState indicating that the Player has won the game', function () {
            assert.deepEqual(gameState, [p1Name, c.EndGameReason.WON]);
          });
        });
        describe('when the Player provides an invalid Turn', function () {
          let boardCopy;
          beforeEach(function () {
            boardCopy = referee.board.copy();
            turn = [["move", { player:p1Name, id:workerId1 }, ["PUT", "PUT"]]];
            player1.takeTurn = sinon.stub().returns(turn);
            gameState = referee.getAndApplyTurn(player1);
          });
          it('does not apply the Turn to the Board', function () {
            // Referee's new board is the same as a copy of the board made before turn
            assert.deepEqual(referee.board, boardCopy);
          });
          it('returns a GameState indicating that the other Player won', function () {
            assert.deepEqual(gameState, [p2Name, c.EndGameReason.BROKEN_RULE]);
          });
        });
      });

      describe('checkTurn', function () {
        it('rejects a Turn if it is improperly formed', function () {
          let turn = [["move", 1, 1],["build", []]];
          assert.isFalse(referee.checkTurn(turn, player1));
        });
        it('rejects a Turn where the WorkerRequest does not match the active player', function () {
          let turn = [["move", { player: p2Name, id: workerId1 }, ["EAST", "NORTH"]],
            ["build", ["EAST", "PUT"]]];
          assert.isFalse(referee.checkTurn(turn, player1));
        });
        it('rejects a Turn that is not valid', function () {
          let turn = [["move", { player: p1Name, id: 1 }, ["WEST", "NORTH"]],
            ["build", ["EAST", "PUT"]]];
          assert.isFalse(referee.checkTurn(turn, player1));
        });
        it('accepts a properly formed, correct-player-referencing, valid Turn', function () {
          let turn = [["move", { player: p1Name, id: 1 }, ["EAST", "PUT"]]];
          assert.isTrue(referee.checkTurn(turn, player1));
        });
      });
    });

    describe('flip', function () {
      let player1, player2, referee;
      beforeEach(function () {
        player1 = { name: "Wayne", strategy: null };
        player2 = { name: "Garth", strategy: null };
        referee = new Referee(player1, player2);
      });
      it('returns the opposite player', function () {
        assert.equal(referee.flip(player1), player2);
        assert.equal(referee.flip(player2), player1);
      });
    });
  });

  describe('Data checking methods', function () {
    describe('isWellFormedTurn', function () {
      describe('rejects improperly formed Turn when it', function () {
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
      describe('rejects improperly formed PlaceRequest when it', function () {
        it('is not an Array', function () {
          let placeReq = {};
          assert.isFalse(Referee.isWellFormedPlaceReq(placeReq));
        });
        it('is too short', function () {
          let placeReq = ["place"];
          assert.isFalse(Referee.isWellFormedPlaceReq(placeReq));
        });
        it('has the wrong type of data', function () {
          // not "place", first not number, second not number
          let placeReq1 = [3, 2, 3];
          assert.isFalse(Referee.isWellFormedPlaceReq(placeReq1));
          let placeReq2 = ["place", "a", 3];
          assert.isFalse(Referee.isWellFormedPlaceReq(placeReq2));
          let placeReq3 = ["place", 2, 3.3];
          assert.isFalse(Referee.isWellFormedPlaceReq(placeReq3));
        });
      });
      it('accepts properly formed PlaceRequest', function () {
        let placeReq1 = ["place", 2, 3];
        assert.isTrue(Referee.isWellFormedPlaceReq(placeReq1));
      });
    });

    describe('isWellFormedMoveReq', function () {
      describe('rejects improperly formed MoveRequest when it', function () {
        it('is not an Array', function () {
          let moveReq = {};
          assert.isFalse(Referee.isWellFormedMoveReq(moveReq));
        });
        it('is too short', function () {
          let moveReq = ["move"];
          assert.isFalse(Referee.isWellFormedMoveReq(moveReq));
        });
        it('has an improperly formed WorkerRequest', function () {
          let moveReq = ["move", {notPlayer:0}, ["EAST", "PUT"]];
          assert.isFalse(Referee.isWellFormedMoveReq(moveReq));
        });
        it('has an improperly formed Direction', function () {
          let moveReq = ["move", {player:"wayne", id:1}, ["EAST", "I THOUGHT YOU SAID WEAST"]];
          assert.isFalse(Referee.isWellFormedMoveReq(moveReq));
        });
      });
      it('accepts properly formed MoveRequest', function () {
        let moveReq = ["move", {player:"wayne", id:1}, ["PUT", "SOUTH"]];
        assert.isTrue(Referee.isWellFormedMoveReq(moveReq));
      });
    });

    describe('isWellFormedBuildReq', function () {
      describe('rejects improperly formed BuildRequest when it', function () {
        it('is not an Array', function () {
          let buildReq = {};
          assert.isFalse(Referee.isWellFormedBuildReq(buildReq));
        });
        it('is too short', function () {
          let buildReq = ["build"];
          assert.isFalse(Referee.isWellFormedBuildReq(buildReq));
        });
        it('has an improperly formed Direction', function () {
          let buildReq = ["build", ["not", "a", "direction"]];
          assert.isFalse(Referee.isWellFormedBuildReq(buildReq));
        });
      });
      it('accepts properly formed BuildRequest', function () {
        let buildReq = ["build", ["WEST", "PUT"]];
        assert.isTrue(Referee.isWellFormedBuildReq(buildReq));
      });
    });

    describe('isWellFormedWorkerReq', function () {
      describe('rejects improperly formed WorkerRequest when', function () {
        it('is not an Object', function () {
          let workerReq = 0;
          assert.isFalse(Referee.isWellFormedWorkerReq(workerReq));
        });
        it('is missing player or id keys', function () {
          let workerReq1 = {player:"garth", instrument:"bass"};
          assert.isFalse(Referee.isWellFormedWorkerReq(workerReq1));
          let workerReq2 = {shellfish:"scallop", id:9};
          assert.isFalse(Referee.isWellFormedWorkerReq(workerReq2));
        });
        it('has any additional keys', function () {
          let workerReq = {player:"garth", instrument:"bass", id:1};
          assert.isFalse(Referee.isWellFormedWorkerReq(workerReq));
        });
        it('player or id are the wrong type', function () {
          let workerReq1 = {player:"garth", id:"1"};
          assert.isFalse(Referee.isWellFormedWorkerReq(workerReq1));
          let workerReq2 = {player:0, id:1};
          assert.isFalse(Referee.isWellFormedWorkerReq(workerReq2));
        });
      });
      it('accepts properly formed WorkerRequest', function () {
        let workerReq = {player:"garth", id:1};
        assert.isTrue(Referee.isWellFormedWorkerReq(workerReq));
      });
    });
  });
});