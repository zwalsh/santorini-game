let assert = require('chai').assert;
let sinon = require('sinon');
let Referee = require('../Admin/referee');
let Worker = require('../Common/worker');
let Board = require('../Common/board');
let c = require('../Lib/constants');

describe('Referee', function () {

  describe('Game playing methods', function () {

    describe('playGame', function () {
      let board, referee, player1, player2, p2Turn;
      let p1Name = "wayne";
      let p2Name = "garth";
      beforeEach(function () {
        let grid = [[2, 3, 0, 0, 0, 0],
          [3, 3, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0]];

        let w11 = new Worker(0, 0, 1, p1Name);
        let w12 = new Worker(4, 0, 2, p1Name);
        let w21 = new Worker(5, 0, 1, p2Name);
        let w22 = new Worker(6, 0, 2, p2Name);
        let workerList = [w11, w12, w21, w22];

        board = new Board(null, grid, workerList);

        p2Turn = [["move", {player:p2Name, id:1}, ["PUT", "SOUTH"]], ["build", ["PUT", "SOUTH"]]];
        player2 = {
          name: p2Name,
          takeTurn: sinon.stub().withArgs(board).returns(p2Turn),
          notifyGameOver: sinon.stub(),
          newGame: sinon.stub()
        };

        player1 = {
          name: p1Name,
          notifyGameOver: sinon.stub(),
          newGame: sinon.stub()
        };
        referee = new Referee(player2, player1);
        referee.board = board;
        referee.setup = sinon.stub().returns(c.GameState.IN_PROGRESS);
      });
      describe('when neither Player provides an invalid Turn', function () {
        let gameResult;
        beforeEach(function () {
          let p1Turn = [["move", {player:p1Name, id:1}, ["EAST", "PUT"]]];
          let boardAfterP2Turn = board.copy();
          boardAfterP2Turn.applyTurn(p2Turn);

          player1.takeTurn = sinon.stub().withArgs(boardAfterP2Turn).returns(p1Turn),
          gameResult = referee.playGame();
        });
        it('notifies both Players of the game start and opponent name', function () {
          assert.isTrue(player1.newGame.calledWith(p2Name));
          assert.isTrue(player2.newGame.calledWith(p1Name));
        });
        it('requests Turns from both', function () {
          assert.deepEqual(gameResult, [p1Name, c.EndGameReason.WON]);
          assert.isTrue(player1.takeTurn.calledOnce);
          assert.isTrue(player2.takeTurn.calledOnce);
        });
        it('notifies both Players that the winning Player won', function () {
          assert.deepEqual(gameResult, [p1Name, c.EndGameReason.WON]);
          assert.isTrue(player1.notifyGameOver.calledWith(gameResult));
          assert.isTrue(player2.notifyGameOver.calledWith(gameResult));
        });
      });
      describe('when a Player provides an invalid Turn', function () {
        let gameResult;
        beforeEach(function () {
          let p1Turn = [["move", {player:p1Name, id:1}, ["EAST", "FALSE"]]];
          let boardAfterP2Turn = board.copy();
          boardAfterP2Turn.applyTurn(p2Turn);

          player1.takeTurn = sinon.stub().withArgs(boardAfterP2Turn).returns(p1Turn);
          gameResult = referee.playGame();
        });
        it('notifies both Players that the non-rule-breaking Player won', function () {
          assert.deepEqual(gameResult, [p2Name, c.EndGameReason.BROKEN_RULE]);
          assert.isTrue(player1.notifyGameOver.calledWith(gameResult));
          assert.isTrue(player2.notifyGameOver.calledWith(gameResult));
        });
      });
    });

    describe('playNGames', function () {
      let player1, player2, p1Name, p2Name, workerId1, referee;
      beforeEach(function () {
        workerId1 = 1;
        p1Name = "Wayne";
        p2Name = "Garth";
        player1 = { name: p1Name, strategy: null };
        player2 = { name: p2Name, strategy: null };
        referee = new Referee(player1, player2);
      });
      describe('when neither Player breaks a rule in any game', function () {
        let resultList, result1, result2, result3;
        beforeEach(function () {
          result1 = [p1Name, c.EndGameReason.WON];
          result2 = [p2Name, c.EndGameReason.WON];
          result3 = [p1Name, c.EndGameReason.WON];
          referee.playGame = sinon.stub()
            .onFirstCall().returns(result1)
            .onSecondCall().returns(result2)
            .onThirdCall().returns(result3);
          resultList = referee.playNGames(3);
        });
        it('plays the necessary number of games to determine a winner', function () {
          assert.equal(referee.playGame.callCount, 3);
        });
        it('returns the correct GameResult list', function () {
          assert.equal(resultList.length, 3);
          assert.deepEqual(resultList[0], result1);
          assert.deepEqual(resultList[1], result2);
          assert.deepEqual(resultList[2], result3);
        });
      });
      describe('when a Player wins a majority of games before the series is over', function () {
        let resultList, result1, result2;
        beforeEach(function () {
          result1 = [p1Name, c.EndGameReason.WON];
          result2 = [p1Name, c.EndGameReason.WON];
          referee.playGame = sinon.stub()
            .onFirstCall().returns(result1)
            .onSecondCall().returns(result2);
          resultList = referee.playNGames(3);
        });
        it('plays the necessary number of games to determine a winner', function () {
          assert.equal(referee.playGame.callCount, 2);
        });
        it('returns the correct GameResult list', function () {
          assert.equal(resultList.length, 2);
          assert.deepEqual(resultList[0], result1);
          assert.deepEqual(resultList[1], result2);
        });
      });
      describe('when a Player breaks a rule in a game', function () {
        let resultList, result1, result2;
        beforeEach(function () {
          result1 = [p1Name, c.EndGameReason.WON];
          result2 = [p2Name, c.EndGameReason.BROKEN_RULE];
          referee.playGame = sinon.stub()
            .onFirstCall().returns(result1)
            .onSecondCall().returns(result2);
          resultList = referee.playNGames(3);
        });
        it('terminates that game and does not play any more games', function () {
          assert.equal(referee.playGame.callCount, 2);
        });
        it('returns the correct GameResult list', function () {
          assert.equal(resultList.length, 2);
          assert.deepEqual(resultList[0], result1);
          assert.deepEqual(resultList[1], result2);
        });
      });
    });

    describe('getSeriesStatus', function () {
      let player1, player2, p1Name, p2Name, workerId1, referee, gameResults;
      beforeEach(function () {
        workerId1 = 1;
        p1Name = "Wayne";
        p2Name = "Garth";
        player1 = { name: p1Name, strategy: null };
        player2 = { name: p2Name, strategy: null };
        referee = new Referee(player1, player2);
        gameResults = [[p1Name, c.EndGameReason.WON]];
      });
      it('indicates that the series is still in progress if neither player has won a majority', function () {
        gameResults.push([p2Name, c.EndGameReason.WON]);
        let status = referee.getSeriesStatus(gameResults, 3);
        assert.equal(status, c.GameState.IN_PROGRESS);
      });
      it('if a player has won a majority, returns a GameState with that player as the winner', function () {
        gameResults.push([p1Name, c.EndGameReason.WON]);
        let status = referee.getSeriesStatus(gameResults, 3);
        assert.deepEqual(status, [p1Name, c.EndGameReason.WON]);
      });
    });

    describe('setup', function () {
      let player1, player2, p1Name, p2Name, workerId1, workerId2, referee, gameState;
      beforeEach(function () {
        workerId1 = 1;
        workerId2 = 2;
        p1Name = "Wayne";
        p2Name = "Garth";
        player1 = { name: p1Name, strategy: null };
        player2 = { name: p2Name, strategy: null };
        referee = new Referee(player1, player2);
        // Player 1 gives two valid PlaceRequests.
        player1.placeInitialWorker = sinon.stub()
          .onFirstCall().returns(["place", 0, 0])
          .onSecondCall().returns(["place", 2, 2]);
        // Player 2 gives at least one valid PlaceRequest (second depends on test case)
        player2.placeInitialWorker = sinon.stub()
          .onFirstCall().returns(["place", 1, 1]);
      });
      describe('when a Player provides an invalid PlaceRequest', function () {
        beforeEach(function () {
          player2.placeInitialWorker
            .onSecondCall().returns(["place", 2, 2]);
          gameState = referee.setup();
        });
        it('returns a GameState indicating that the other Player won', function () {
          assert.deepEqual(gameState, [p1Name, c.EndGameReason.BROKEN_RULE]);
        });
        it('does not create a new Board for the Referee', function () {
          assert.isNull(referee.board);
        });
      });
      describe('when both Players provide valid PlaceRequests', function () {
        beforeEach(function () {
          player2.placeInitialWorker
            .onSecondCall().returns(["place", 3, 3]);
          gameState = referee.setup();
        });
        it('requests two PlaceRequests from each Player', function () {
          assert.equal(player1.placeInitialWorker.callCount, 2);
          assert.equal(player2.placeInitialWorker.callCount, 2);
        });
        it('creates a Board with all four workers correctly added to the Referee"s Board', function () {
          let w1 = referee.board.findWorker({ player: p1Name, id: workerId1});
          let w2 = referee.board.findWorker({ player: p2Name, id: workerId1});
          let w3 = referee.board.findWorker({ player: p1Name, id: workerId2});
          let w4 = referee.board.findWorker({ player: p2Name, id: workerId2});
          assert.equal(referee.board.getWorkers().length, 4);
          assert.equal(w1.posn.x, 0);
          assert.equal(w1.posn.y, 0);
          assert.equal(w2.posn.x, 1);
          assert.equal(w2.posn.y, 1);
          assert.equal(w3.posn.x, 2);
          assert.equal(w3.posn.y, 2);
          assert.equal(w4.posn.x, 3);
          assert.equal(w4.posn.y, 3);
        });
        it('returns a GameState indicating that the game should continue', function () {
          assert.equal(gameState, c.GameState.IN_PROGRESS);
        });
      });
    });

    describe('checkPlaceReq', function () {
      it('rejects a PlaceRequest if it is improperly formed', function () {
        let placeReq = [3, 2, 3];
        assert.isFalse(Referee.checkPlaceReq(placeReq, []));
      });
      it('rejects a PlaceRequest that is not valid', function () {
        let initWorkerList = [{ player: 'wayne', x: 1, y: 1 }];
        let placeReq = ["place", 1, 1];
        assert.isFalse(Referee.checkPlaceReq(placeReq, initWorkerList));
      });
      it('accepts a properly formed, valid PlaceRequest', function () {
        let initWorkerList = [{ player: 'wayne', x: 1, y: 1 }];
        let placeReq = ["place", 0, 0];
        assert.isTrue(Referee.checkPlaceReq(placeReq, initWorkerList));
      });
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