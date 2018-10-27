let assert = require('chai').assert;
let sinon = require('sinon');
let uuid = require('uuid/v4');
let Referee = require('../Admin/referee');
let Worker = require('../Common/worker');
let Board = require('../Common/board');
let c = require('../Lib/constants');
let testLib = require('./test-lib');

describe('Referee', function () {
  const startGame = 'startGame';
  const gameOver = 'gameOver';
  const turnTaken = 'turnTaken';
  const workerPlaced = 'workerPlaced';
  const startSeries = 'startSeries';
  const seriesOver = 'seriesOver';

  describe('playGame', function () {
    let board, referee, player2, player1, p1Turn, observer;
    let p1Id = uuid();
    let p2Id = uuid();
    beforeEach(function () {
      let grid = [[2, 3, 0, 0, 0, 0],
        [3, 3, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0]];

      let w11 = new Worker(0, 0, 1, p2Id);
      let w12 = new Worker(4, 0, 2, p2Id);
      let w21 = new Worker(5, 0, 1, p1Id);
      let w22 = new Worker(6, 0, 2, p1Id);
      let workerList = [w11, w12, w21, w22];

      // The Referee will not ask for any PlaceRequests in this case, because we
      // initialize a Board with all of the Workers already on it.
      board = new Board(null, grid, workerList);

      p1Turn = [["move", {player:p1Id, id:1}, ["PUT", "SOUTH"]], ["build", ["PUT", "SOUTH"]]];
      player1 = {
        name: p1Id,
        takeTurn: sinon.stub().withArgs(board).returns(p1Turn),
        notifyGameOver: sinon.stub(),
        newGame: sinon.stub()
      };

      player2 = {
        name: p2Id,
        notifyGameOver: sinon.stub(),
        newGame: sinon.stub()
      };
      referee = new Referee(player1, player2, p1Id, p2Id);
      referee.board = board;
      referee.setup = sinon.stub().returns(c.GameState.IN_PROGRESS);

      observer = testLib.createMockObject(startGame, workerPlaced, turnTaken, gameOver);
      referee.addObserver(observer);
    });
    describe('when neither Player provides an invalid Turn', function () {
      let gameResult;
      beforeEach(function () {
        let p2Turn = [["move", {player:p2Id, id:1}, ["EAST", "PUT"]]];
        let boardAfterP1Turn = board.copy();
        boardAfterP1Turn.applyTurn(p1Turn);

        player2.takeTurn = sinon.stub().withArgs(boardAfterP1Turn).returns(p2Turn),
        gameResult = referee.playGame();
      });
      it('notifies both Players of the game start and opponent name', function () {
        assert.isTrue(player2.newGame.calledWith(p2Id, p1Id));
        assert.isTrue(player1.newGame.calledWith(p1Id, p2Id));
      });
      it('requests Turns from both', function () {
        assert.deepEqual(gameResult, [p2Id, c.EndGameReason.WON]);
        assert.isTrue(player2.takeTurn.calledOnce);
        assert.isTrue(player1.takeTurn.calledOnce);
      });
      it('notifies both Players that the winning Player won', function () {
        assert.deepEqual(gameResult, [p2Id, c.EndGameReason.WON]);
        assert.isTrue(player2.notifyGameOver.calledWith(gameResult));
        assert.isTrue(player1.notifyGameOver.calledWith(gameResult));
      });
      it('notifies the Observer that the game has begun', function () {
        assert.isTrue(observer[startGame].calledOnce);
        assert.isTrue(observer[startGame].calledWith(p1Id, p2Id));
      });
      it('notifies the Observer that the game has ended', function () {
        assert.isTrue(observer[gameOver].calledOnce);
        assert.isTrue(observer[gameOver].calledWith(gameResult));
      })
    });
    describe('when a Player provides an invalid Turn', function () {
      let gameResult;
      beforeEach(function () {
        let p2Turn = [["move", {player:p2Id, id:1}, ["EAST", "FALSE"]]];
        let boardAfterP2Turn = board.copy();
        boardAfterP2Turn.applyTurn(p1Turn);

        player2.takeTurn = sinon.stub().withArgs(boardAfterP2Turn).returns(p2Turn);
        gameResult = referee.playGame();
      });
      it('notifies both Players that the non-rule-breaking Player won', function () {
        assert.deepEqual(gameResult, [p1Id, c.EndGameReason.BROKEN_RULE]);
        assert.isTrue(player2.notifyGameOver.calledWith(gameResult));
        assert.isTrue(player1.notifyGameOver.calledWith(gameResult));
      });
    });
  });

  describe('playNGames', function () {
    let player1, player2, p1Id, p2Id, workerId1, referee, observer;
    beforeEach(function () {
      workerId1 = 1;
      p1Id = uuid();
      p2Id = uuid();
      player1 = { id: p1Id, strategy: null };
      player2 = { id: p2Id, strategy: null };
      referee = new Referee(player1, player2, p1Id, p2Id);

      observer = testLib.createMockObject(startGame, workerPlaced, turnTaken, gameOver, startSeries, seriesOver);
      referee.addObserver(observer);
    });
    describe('when neither Player breaks a rule in any game', function () {
      let resultList, result1, result2, result3;
      beforeEach(function () {
        result1 = [p1Id, c.EndGameReason.WON];
        result2 = [p2Id, c.EndGameReason.WON];
        result3 = [p1Id, c.EndGameReason.WON];
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
      it('notifies the Observer that the series has started', function () {
        assert.isTrue(observer[startSeries].calledOnce);
        assert.isTrue(observer[startSeries].calledWith(p1Id, p2Id));
      });
      it('notifies the Observer that the series has ended', function () {
        assert.isTrue(observer[seriesOver].calledOnce);
        assert.isTrue(observer[seriesOver].calledWith(resultList));
      });
    });
    describe('when a Player wins a majority of games before the series is over', function () {
      let resultList, result1, result2;
      beforeEach(function () {
        result1 = [p1Id, c.EndGameReason.WON];
        result2 = [p1Id, c.EndGameReason.WON];
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
        result1 = [p1Id, c.EndGameReason.WON];
        result2 = [p2Id, c.EndGameReason.BROKEN_RULE];
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
    let player1, player2, p1Id, p2Id, workerId1, referee, gameResults;
    beforeEach(function () {
      workerId1 = 1;
      p1Id = uuid();
      p2Id = uuid();
      player1 = { id: p1Id, strategy: null };
      player2 = { id: p2Id, strategy: null };
      referee = new Referee(player1, player2, p1Id, p2Id);
      gameResults = [[p1Id, c.EndGameReason.WON]];
    });
    it('indicates that the series is still in progress if neither player has won a majority', function () {
      gameResults.push([p2Id, c.EndGameReason.WON]);
      let status = referee.getSeriesStatus(gameResults, 3);
      assert.equal(status, c.GameState.IN_PROGRESS);
    });
    it('if a player has won a majority, returns a GameState with that player as the winner', function () {
      gameResults.push([p1Id, c.EndGameReason.WON]);
      let status = referee.getSeriesStatus(gameResults, 3);
      assert.deepEqual(status, [p1Id, c.EndGameReason.WON]);
    });
  });

  describe('setup', function () {
    let player1, player2, p1Id, p2Id, workerId1, workerId2, referee, gameState, observer;
    let placeRequest0 = ["place", 0, 0];
    let placeRequest1 = ["place", 1, 1];
    let placeRequest2 = ["place", 2, 2];
    beforeEach(function () {
      workerId1 = 1;
      workerId2 = 2;
      p1Id = uuid();
      p2Id = uuid();
      player1 = { id: p1Id, strategy: null };
      player2 = { id: p2Id, strategy: null };
      referee = new Referee(player1, player2, p1Id, p2Id);
      // Player 1 gives two valid PlaceRequests.
      player1.placeInitialWorker = sinon.stub()
        .onFirstCall().returns(placeRequest0)
        .onSecondCall().returns(placeRequest2);
      // Player 2 gives at least one valid PlaceRequest (second depends on test case)
      player2.placeInitialWorker = sinon.stub()
        .onFirstCall().returns(placeRequest1);

      observer = testLib.createMockObject(workerPlaced);
      referee.addObserver(observer);
    });
    describe('when a Player provides an invalid PlaceRequest', function () {
      beforeEach(function () {
        player2.placeInitialWorker
          .onSecondCall().returns(["place", 2, 2]);
        gameState = referee.setup();
      });
      it('returns a GameState indicating that the other Player won', function () {
        assert.deepEqual(gameState, [p1Id, c.EndGameReason.BROKEN_RULE]);
      });
      it('does not create a new Board for the Referee', function () {
        assert.isNull(referee.board);
      });
    });
    describe('when both Players provide valid PlaceRequests', function () {
      let placeRequest3 = ["place", 3, 3];
      beforeEach(function () {
        player2.placeInitialWorker
          .onSecondCall().returns(placeRequest3);
        gameState = referee.setup();
      });
      it('requests two PlaceRequests from each Player', function () {
        assert.equal(player1.placeInitialWorker.callCount, 2);
        assert.equal(player2.placeInitialWorker.callCount, 2);
      });
      it('creates a Board with all four workers correctly added to the Referee"s Board', function () {
        let w1 = referee.board.findWorker({ player: p1Id, id: workerId1});
        let w2 = referee.board.findWorker({ player: p2Id, id: workerId1});
        let w3 = referee.board.findWorker({ player: p1Id, id: workerId2});
        let w4 = referee.board.findWorker({ player: p2Id, id: workerId2});
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
      it('notifies the Observer of all placements', function () {
        /* Natural PlaceRequest String Int [Worker, ...] -> Void
          Given a call index n, check that the nth call of workerPlaced on the
          Observer contains the expected information.
          Calling this function adds a Worker (specified by the given PlaceRequest, player name,
          and worker ID) to the list boardWorkers.
         */
        function checkPlaceNotification(callIdx, placeReq, pName, workerId, boardWorkers) {
          let call = observer[workerPlaced].getCall(callIdx);
          assert.deepEqual(call.args[0], placeReq);
          assert.equal(call.args[1], pName);
          boardWorkers.push(new Worker(placeReq[1], placeReq[2], workerId, pName));
          let board = call.args[2];
          assert.deepEqual(board.getWorkers(), boardWorkers);
        }

        let boardWorkers = [];
        checkPlaceNotification(0, placeRequest0, p1Id, workerId1, boardWorkers);
        checkPlaceNotification(1, placeRequest1, p2Id, workerId1, boardWorkers);
        checkPlaceNotification(2, placeRequest2, p1Id, workerId2, boardWorkers);
        checkPlaceNotification(3, placeRequest3, p2Id, workerId2, boardWorkers);
      });
    });
  });

  describe('checkPlaceReq', function () {
    let p1Id, p2Id, referee;
    beforeEach(function () {
      p1Id = uuid();
      p2Id = uuid();
      let player1 = {id: p1Id, strategy: null};
      let player2 = {id: p2Id, strategy: null};
      referee = new Referee(player1, player2, p1Id, p2Id);
    });
    it('rejects a PlaceRequest if it is improperly formed', function () {
      let placeReq = [3, 2, 3];
      assert.isFalse(referee.checkPlaceReq(placeReq, []));
    });
    it('rejects a PlaceRequest that is not valid', function () {
      let initWorkerList = [{ player: p1Id, x: 1, y: 1 }];
      let placeReq = ["place", 1, 1];
      assert.isFalse(referee.checkPlaceReq(placeReq, initWorkerList));
    });
    it('accepts a properly formed, valid PlaceRequest', function () {
      let initWorkerList = [{ player: p1Id, x: 1, y: 1 }];
      let placeReq = ["place", 0, 0];
      assert.isTrue(referee.checkPlaceReq(placeReq, initWorkerList));
    });
  });

  describe('Turn-related functionality', function () {
    let player1, player2, p1Id, p2Id, workerId1, referee;
    beforeEach(function () {
      workerId1 = 1;
      p1Id = uuid();
      p2Id = uuid();
      player1 = { id: p1Id, strategy: null };
      player2 = { id: p2Id, strategy: null };
      referee = new Referee(player1, player2, p1Id, p2Id);

      // Create a Board with the following heights, one Player1 worker
      // in the top left corner, and one Player2 worker in the top right corner.
      let heights = [[2, 3, 0, 0, 0, 0],
                    [2, 3, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0]];
      let worker1 = new Worker(0,0,workerId1,p1Id);
      let worker2 = new Worker(5,0,workerId1,p2Id);
      let board = new Board(null, heights, [worker1, worker2]);
      referee.board = board;
    });
    describe('getAndApplyTurn', function () {
      let turn, gameState;
      describe('when the Player provides a valid non-winning Turn', function () {
        let observer;
        beforeEach(function () {
          turn = [["move", { player:p1Id, id:workerId1 }, ["PUT", "SOUTH"]],
            ["build", ["PUT", "SOUTH"]]];
          player1.takeTurn = sinon.stub().returns(turn);

          observer = testLib.createMockObject(turnTaken);
          referee.addObserver(observer);

          gameState = referee.getAndApplyTurn(player1);
        });
        it('applies the player"s turn to the Board', function () {
          let worker = referee.board.findWorker({player:p1Id,id:workerId1});
          assert.equal(worker.posn.x, 0);
          assert.equal(worker.posn.y, 1);
          assert.equal(referee.board.heightAtTile(0,2), 1);
        });
        it('returns a GameState indicating that the game should continue', function () {
          assert.deepEqual(gameState, c.GameState.IN_PROGRESS);
        });
        it('notifies the Observer that a turn was taken', function () {
          assert.isTrue(observer[turnTaken].calledOnce);
          let call0Args = observer[turnTaken].getCall(0).args;
          let observerTurn = call0Args[0];
          let observerBoard = call0Args[1];

          assert.deepEqual(observerTurn, turn);
          assert.deepEqual(observerBoard, referee.board);
        });
      });
      describe('when the Player provides a valid winning Turn', function () {
        beforeEach(function () {
          turn = [["move", { player:p1Id, id:workerId1 }, ["EAST", "SOUTH"]]];
          player1.takeTurn = sinon.stub().returns(turn);
          gameState = referee.getAndApplyTurn(player1);
        });
        it('applies the player"s turn to the Board', function () {
          // show that the worker moved to the expected location
          let worker = referee.board.findWorker({player:p1Id,id:workerId1});
          assert.equal(worker.posn.x, 1);
          assert.equal(worker.posn.y, 1);
        });
        it('returns a GameState indicating that the Player has won the game', function () {
          assert.deepEqual(gameState, [p1Id, c.EndGameReason.WON]);
        });
      });
      describe('when the Player provides an invalid Turn', function () {
        let boardCopy, observer;
        beforeEach(function () {
          boardCopy = referee.board.copy();
          turn = [["move", { player:p1Id, id:workerId1 }, ["PUT", "PUT"]]];
          player1.takeTurn = sinon.stub().returns(turn);

          observer = testLib.createMockObject(turnTaken);
          referee.addObserver(observer);

          gameState = referee.getAndApplyTurn(player1);
        });
        it('does not apply the Turn to the Board', function () {
          // Referee's new board is the same as a copy of the board made before turn
          assert.deepEqual(referee.board, boardCopy);
        });
        it('returns a GameState indicating that the other Player won', function () {
          assert.deepEqual(gameState, [p2Id, c.EndGameReason.BROKEN_RULE]);
        });
        it('does not notify the Observer that any turn was taken', function () {
          assert.isFalse(observer[turnTaken].called);
        })
      });
    });

    describe('checkTurn', function () {
      it('rejects a Turn if it is improperly formed', function () {
        let turn = [["move", 1, 1],["build", []]];
        assert.isFalse(referee.checkTurn(turn, player1));
      });
      it('rejects a Turn where the WorkerRequest does not match the active player', function () {
        let turn = [["move", { player: p2Id, id: workerId1 }, ["EAST", "NORTH"]],
          ["build", ["EAST", "PUT"]]];
        assert.isFalse(referee.checkTurn(turn, player1));
      });
      it('rejects a Turn that is not valid', function () {
        let turn = [["move", { player: p1Id, id: 1 }, ["WEST", "NORTH"]],
          ["build", ["EAST", "PUT"]]];
        assert.isFalse(referee.checkTurn(turn, player1));
      });
      it('accepts a properly formed, correct-player-referencing, valid Turn', function () {
        let turn = [["move", { player: p1Id, id: 1 }, ["EAST", "PUT"]]];
        assert.isTrue(referee.checkTurn(turn, player1));
      });
    });
  });

  describe('flip', function () {
      let player1, player2, referee;
      beforeEach(function () {
        let p1Id = uuid();
        let p2Id = uuid();
        player1 = { name: p1Id, strategy: null };
        player2 = { name: p2Id, strategy: null };
        referee = new Referee(player1, player2, p1Id, p2Id);
      });
      it('returns the opposite player', function () {
        assert.equal(referee.flip(player1), player2);
        assert.equal(referee.flip(player2), player1);
      });
    });

  describe('playerId', function () {
    let player1, player2, p1Id, p2Id, referee;
    beforeEach(function () {
      p1Id = uuid();
      p2Id = uuid();
      player1 = { name: p1Id, strategy: null };
      player2 = { name: p2Id, strategy: null };
      referee = new Referee(player1, player2, p1Id, p2Id);
    });
    it('gets the correct UUID for the given Player', function () {
      assert.equal(referee.playerId(player1), p1Id);
      assert.equal(referee.playerId(player2), p2Id);
    });
  });

  describe('adding and notifying Observers', function () {
    let referee, player1, player2, p1Id, p2Id, observer1, observer2, mockedMethodName;
    beforeEach(function () {
      p1Id = uuid();
      p2Id = uuid();
      player1 = { name: p1Id, strategy: null };
      player2 = { name: p2Id, strategy: null };
      referee = new Referee(player1, player2, p1Id, p2Id);
      mockedMethodName = 'test';
      observer1 = testLib.createMockObject(mockedMethodName);
      observer2 = testLib.createMockObject(mockedMethodName);
      referee.addObserver(observer1);
      referee.addObserver(observer2);
    });

    it('adds the observers to the observer list', function () {
      assert.equal(2, referee.observers.length);
    });
    it('notifies each observer in the list', function () {
      let notifier = (o) => { o[mockedMethodName]() };
      referee.notifyAllObservers(notifier);
      assert.isTrue(observer1[mockedMethodName].called);
      assert.isTrue(observer2[mockedMethodName].called);
    });
  });
});


