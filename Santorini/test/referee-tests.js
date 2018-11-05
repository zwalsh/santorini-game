const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const sinon = require('sinon');
const uuid = require('uuid/v4');
const Referee = require('../Admin/referee');
const Worker = require('../Common/worker');
const Board = require('../Common/board');
const GameResult = require('../Common/game-result');
const c = require('../Common/constants');
const testLib = require('./test-lib');

/** Note on testing with Promises:
 *
 * Every external Referee method (and many internal ones) returns a
 * Promise with a value. All tests for Referee methods that return Promises
 * must either use expect().to.eventually... or be wrapped in a .then() call
 * on the Promise value returned by the Referee method being tested.
 * it()s that call .then() on the Promise must return that call.
 *
 *  - return expect(promise).to.eventually.[deep.]equal(val)
 *    is used for testing the promise value itself
 *
 *  - return promise.then((promiseValue) => { ...assertions... });
 *    is good for testing side effects of the Referee method,
 *    or for checking specific properties
 *    of the promiseValue that the promise resolves to.
 *
 *
 * Note on mocking with GuardedPlayers:
 *
 * Ensure that all mocked GuardedPlayer methods return Promises.
 * sinon.stub().resolves(value) is useful for this.
 *
 */

function makePlayer(id, playerObj) {
  if (!playerObj) {
    playerObj = {};
  }
  playerObj.getId = () => id;
  return playerObj;
}

describe('Referee', function () {
  const startGame = 'startGame';
  const gameOver = 'gameOver';
  const turnTaken = 'turnTaken';
  const workerPlaced = 'workerPlaced';
  const startSeries = 'startSeries';
  const seriesOver = 'seriesOver';

  describe('playGame', function () {
    let board, referee, player2, player1, p1Turn, observer;
    let p1Id = "p1";
    let p2Id = "p2";
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
      player1 = makePlayer(p1Id, {
        takeTurn: sinon.stub().withArgs(board).resolves(p1Turn),
        notifyGameOver: sinon.stub().returns(Promise.resolve()),
        newGame: sinon.stub().returns(Promise.resolve())
      });

      player2 = makePlayer(p2Id, {
        notifyGameOver: sinon.stub().returns(Promise.resolve()),
        newGame: sinon.stub().returns(Promise.resolve())
      });
      referee = new Referee(player1, player2);
      referee.board = board;

      observer = testLib.createMockObject(startGame, workerPlaced, turnTaken, gameOver);
      referee.addObserver(observer);
    });
    describe('when the first Player breaks when notified of the new game', function () {
      let gameResult;
      beforeEach(function ()  {
        player1.newGame = sinon.stub().returns(Promise.reject());
        gameResult = referee.playGame();
      });
      it('returns a GameResult indicating that the other Player won', function () {
        let expectedGameResult = new GameResult(p2Id, p1Id, c.EndGameReason.BROKEN_RULE);
        return expect(gameResult).to.eventually.deep.equal(expectedGameResult);
      });
    });
    describe('when the second Player breaks when notified of the new game', function () {
      let gameResult;
      beforeEach(function ()  {
        player2.newGame = sinon.stub().returns(Promise.reject());
        gameResult = referee.playGame();
      });
      it('returns a GameResult indicating that the other Player won', function () {
        let expectedGameResult = new GameResult(p1Id, p2Id, c.EndGameReason.BROKEN_RULE);
        return expect(gameResult).to.eventually.deep.equal(expectedGameResult);
      });
    });
    describe('when neither Player provides an invalid Turn', function () {
      let gameResult;
      beforeEach(function () {
        let p2Turn = [["move", {player:p2Id, id:1}, ["EAST", "PUT"]]];
        let boardAfterP1Turn = board.copy();
        boardAfterP1Turn.applyTurn(p1Turn);

        player2.takeTurn = sinon.stub().withArgs(boardAfterP1Turn).resolves(p2Turn);
        referee.setup = sinon.stub().resolves(c.GameState.IN_PROGRESS);
        gameResult = referee.playGame();
      });
      it('notifies both Players of the game start and opponent name', function () {
        return gameResult.then(() => {
          assert.isTrue(player2.newGame.calledWith(p1Id));
          assert.isTrue(player1.newGame.calledWith(p2Id));
          return;
        });
      });
      it('requests Turns from both', function () {
        return gameResult.then(() => {
          assert.isTrue(player2.takeTurn.calledOnce);
          assert.isTrue(player1.takeTurn.calledOnce);
          return;
        });
      });
      it('returns a GameResult indicating that the winning player won', function () {
        let expectedGameResult = new GameResult(p2Id, p1Id, c.EndGameReason.WON);
        return expect(gameResult).to.eventually.deep.equal(expectedGameResult);
      });
      it('notifies both Players that the winning Player won', function () {
        return gameResult.then((gr) => {
          assert.isTrue(player2.notifyGameOver.calledWith(gr));
          assert.isTrue(player1.notifyGameOver.calledWith(gr));
          return;
        });
      });
      // This is important to test maybe, but too difficult within the scenario set up here.
      xit('notifies the Observer that the game has ended', function () {
        return gameResult.then((gr) => {
          assert.isTrue(observer[gameOver].calledOnce);
          assert.isTrue(observer[gameOver].calledWith(gr));
          return;
        });
      });
    });
    describe('when a Player provides an invalid Turn', function () {
      let gameResult;
      beforeEach(function () {
        let p2Turn = [["move", {player: p2Id, id: 1}, ["EAST", "FALSE"]]];
        let boardAfterP2Turn = board.copy();
        boardAfterP2Turn.applyTurn(p1Turn);

        player2.takeTurn = sinon.stub().withArgs(boardAfterP2Turn).resolves(p2Turn);
        referee.setup = sinon.stub().resolves(c.GameState.IN_PROGRESS);
        gameResult = referee.playGame();
      });
      it('returns a GameResult indicating that the non-rule-breaking Player won', function () {
        let expectedGameResult = new GameResult(p1Id, p2Id, c.EndGameReason.BROKEN_RULE);
        return expect(gameResult).to.eventually.deep.equal(expectedGameResult);
      });
      it('notifies only the non-rule-breaking Player that they won', function () {
        return gameResult.then((gr) => {
          assert.isFalse(player2.notifyGameOver.called);
          assert.isTrue(player1.notifyGameOver.calledWith(gr));
          return;
        });
      });
    });
    describe('when the game finishes with no broken rules', function () {
      let gameResult;
      beforeEach(function () {
        let p2Turn = [["move", {player:p2Id, id:1}, ["EAST", "PUT"]]];
        let boardAfterP1Turn = board.copy();
        boardAfterP1Turn.applyTurn(p1Turn);
        player2.takeTurn = sinon.stub().withArgs(boardAfterP1Turn).resolves(p2Turn);

        referee.setup = sinon.stub().resolves(c.GameState.IN_PROGRESS);
      });
      describe('when the first Player breaks when notified of the end of the game', function () {
        beforeEach(function () {
          player1.notifyGameOver = sinon.stub().returns(Promise.reject());
          gameResult = referee.playGame();
        });
        it('returns a GameResult indicating that the other Player won', function () {
          let expectedGameResult = new GameResult(p2Id, p1Id, c.EndGameReason.BROKEN_RULE);
          return expect(gameResult).to.eventually.deep.equal(expectedGameResult);
        });
      });
      describe('when the second Player breaks when notified of the end of the game', function () {
        beforeEach(function () {
          player2.notifyGameOver = sinon.stub().returns(Promise.reject());
          gameResult = referee.playGame();
        });
        it('returns a GameResult indicating that the other Player won', function () {
          let expectedGameResult = new GameResult(p1Id, p2Id, c.EndGameReason.BROKEN_RULE);
          return expect(gameResult).to.eventually.deep.equal(expectedGameResult);
        });
      });
    });
    describe('when the game ends because of a broken rule', function () {
      let gameResult;
      beforeEach(function () {
        let p2Turn = [["move", {player: p2Id, id: 1}, ["EAST", "FALSE"]]];
        let boardAfterP2Turn = board.copy();
        boardAfterP2Turn.applyTurn(p1Turn);
        player2.takeTurn = sinon.stub().withArgs(boardAfterP2Turn).resolves(p2Turn);

        referee.setup = sinon.stub().resolves(c.GameState.IN_PROGRESS);
      });
      it('does not notify the broken player of the end game', function () {
        referee.playGame();
        assert.isFalse(player2.notifyGameOver.called);
      });
      describe('when the other Player breaks when notified of the end game', function () {
        beforeEach(function () {
          player1.notifyGameOver = sinon.stub().returns(Promise.reject());
          gameResult = referee.playGame();
        });
        it('returns false (instead of a GameResult) to indicate that both Players broke', function () {
          let expectedGameResult = false;
          return expect(gameResult).to.eventually.deep.equal(expectedGameResult);
        });
      });
    });
  });

  describe('playNGames', function () {
    let player1, player2, p1Id, p2Id, workerId1, referee, observer;
    beforeEach(function () {
      workerId1 = 1;
      p1Id = "p1";
      p2Id = "p2";
      player1 = makePlayer(p1Id);
      player2 = makePlayer(p2Id);
      referee = new Referee(player1, player2);

      observer = testLib.createMockObject(startGame, workerPlaced, turnTaken, gameOver, startSeries, seriesOver);
      referee.addObserver(observer);
    });
    describe('when neither Player breaks a rule in any game', function () {
      let resultList, result1, result2, result3;
      beforeEach(function () {
        result1 = new GameResult(p1Id, p2Id, c.EndGameReason.WON);
        result2 = new GameResult(p2Id, p1Id, c.EndGameReason.WON);
        result3 = new GameResult(p1Id, p2Id, c.EndGameReason.WON);
        referee.playGame = sinon.stub()
          .onFirstCall().resolves(result1)
          .onSecondCall().resolves(result2)
          .onThirdCall().resolves(result3);
        resultList = referee.playNGames(3);
      });
      it('plays the necessary number of games to determine a winner', function () {
        return resultList.then(() => {
          return assert.equal(referee.playGame.callCount, 3);
        });
      });
      it('returns the correct GameResult list', function () {
        return resultList.then((rl) => {
          assert.equal(rl.length, 3);
          assert.deepEqual(rl[0], result1);
          assert.deepEqual(rl[1], result2);
          assert.deepEqual(rl[2], result3);
          return;
        });
      });
      it('notifies the Observer that the series has started', function () {
        return resultList.then(() => {
          assert.isTrue(observer[startSeries].calledOnce);
          assert.isTrue(observer[startSeries].calledWith(p1Id, p2Id));
          return;
        });
      });
      // This is important to test, but too difficult given the scenario we have set up currently.
      xit('notifies the Observer that the series has ended', function () {
        return resultList.then((rl) => {
          assert.isTrue(observer[seriesOver].calledOnce);
          assert.isTrue(observer[seriesOver].calledWith(rl));
          return;
        });
      });
    });
    describe('when a Player wins a majority of games before the series is over', function () {
      let resultList, result1, result2;
      beforeEach(function () {
        result1 = new GameResult(p1Id, p2Id, c.EndGameReason.WON);
        result2 = new GameResult(p1Id, p2Id, c.EndGameReason.WON);
        referee.playGame = sinon.stub()
          .onFirstCall().resolves(result1)
          .onSecondCall().resolves(result2);
        resultList = referee.playNGames(3);
      });
      it('plays the necessary number of games to determine a winner', function () {
        return resultList.then(() => {
          return assert.equal(referee.playGame.callCount, 2);
        });
      });
      it('returns the correct GameResult list', function () {
        return resultList.then((rl) => {
          assert.equal(rl.length, 2);
          assert.deepEqual(rl[0], result1);
          assert.deepEqual(rl[1], result2);
          return;
        });
      });
    });
    describe('when a Player breaks a rule in a game', function () {
      let resultList, result1, result2;
      beforeEach(function () {
        result1 = new GameResult(p1Id, p2Id, c.EndGameReason.WON);
        result2 = new GameResult(p2Id, p1Id, c.EndGameReason.BROKEN_RULE);
        referee.playGame = sinon.stub()
          .onFirstCall().resolves(result1)
          .onSecondCall().resolves(result2);
        resultList = referee.playNGames(3);
      });
      it('terminates that game and does not play any more games', function () {
        return resultList.then(() => {
          return assert.equal(referee.playGame.callCount, 2);
        });
      });
      it('returns the correct GameResult list', function () {
        return resultList.then((rl) => {
          assert.equal(rl.length, 2);
          assert.deepEqual(rl[0], result1);
          assert.deepEqual(rl[1], result2);
          return;
        });
      });
    });
  });

  describe('isSeriesOver', function () {
    let player1, player2, p1Id, p2Id, workerId1, referee, gameResults;
    beforeEach(function () {
      workerId1 = 1;
      p1Id = "p1";
      p2Id = "p2";
      player1 = makePlayer(p1Id);
      player2 = makePlayer(p2Id);
      referee = new Referee(player1, player2);
      gameResults = [new GameResult(p1Id, p2Id, c.EndGameReason.WON)];
    });
    it('indicates that the series is still in progress if neither player has won a majority', function () {
      gameResults.push(new GameResult(p2Id, p1Id, c.EndGameReason.WON));
      let status = referee.isSeriesOver(gameResults, 3);
      assert.isFalse(status);
    });
    it('if a player has won a majority, indicates that the series is over', function () {
      gameResults.push(new GameResult(p1Id, p2Id, c.EndGameReason.WON));
      let status = referee.isSeriesOver(gameResults, 3);
      assert.isTrue(status);
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
      p1Id = uuid() + "_p1";
      p2Id = uuid() + "_p2";
      player1 = makePlayer(p1Id);
      player2 = makePlayer(p2Id);
      referee = new Referee(player1, player2);
      // Player 1 gives two valid PlaceRequests.
      player1.placeInitialWorker = sinon.stub()
        .onFirstCall().resolves(placeRequest0)
        .onSecondCall().resolves(placeRequest2);
      // Player 2 gives at least one valid PlaceRequest (second depends on test case)
      player2.placeInitialWorker = sinon.stub()
        .onFirstCall().resolves(placeRequest1);

      observer = testLib.createMockObject(startGame, workerPlaced);
      observer.startGame.returns(Promise.resolve());
      observer.workerPlaced.returns(Promise.resolve());
      referee.addObserver(observer);
    });
    describe('before players are asked for PlaceRequests', function () {
      beforeEach(function () {
        referee.completeSetup = sinon.stub().resolves(c.GameState.IN_PROGRESS);
        gameState = referee.setup(c.GameState.IN_PROGRESS);
      });
      it('notifies the Observer that the game has begun', function () {
        return gameState.then(() => {
          assert.isTrue(observer[startGame].calledOnce);
          assert.isTrue(observer[startGame].calledWith(p1Id, p2Id));
          return;
        });
      });
    });
    describe('when a Player provides an invalid PlaceRequest', function () {
      beforeEach(function () {
        player2.placeInitialWorker
          .onSecondCall().resolves(["place", 2, 2]);
        // gameState is a Promise<GameState>
        gameState = referee.setup(c.GameState.IN_PROGRESS);
      });
      it('returns a GameState indicating that the other Player won', function () {
        let expectedGameResult = new GameResult(p1Id, p2Id, c.EndGameReason.BROKEN_RULE)
        return expect(gameState).to.eventually.deep.equal(expectedGameResult);
      });
      it('does not create a new Board for the Referee', function () {
        return gameState.then(() => {
          assert.isNull(referee.board);
          return;
        });
      });
    });
    describe('when both Players provide valid PlaceRequests', function () {
      let placeRequest3 = ["place", 3, 3];
      beforeEach(function () {
        player2.placeInitialWorker
          .onSecondCall().resolves(placeRequest3);
        referee.notifyAllObservers = sinon.stub();

        gameState = referee.setup(c.GameState.IN_PROGRESS);
      });
      it('requests two PlaceRequests from each Player', function () {
        return gameState.then(() => {
          assert.equal(player1.placeInitialWorker.callCount, 2);
          assert.equal(player2.placeInitialWorker.callCount, 2);
          assert.deepEqual(player1.placeInitialWorker.getCall(0).args[0], []);
          assert.deepEqual(player2.placeInitialWorker.getCall(0).args[0], [{player:p1Id, x: 0, y: 0}]);
          return;
        });
      });
      it('creates a Board with all four workers correctly added to the Referee"s Board', function () {
        return gameState.then(() => {
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
          return;
        });
      });
      it('returns a GameState indicating that the game should continue', function () {
        return expect(gameState).to.eventually.equal(c.GameState.IN_PROGRESS);
      });
      it('notifies the Observer of placements', function () {
        /* Natural PlaceRequest String Int [Worker, ...] -> Void
          Given a call index n, check that the nth call of workerPlaced on the
          Observer contains the expected information.
         */
        function verifyPlaceNotification(callIdx, placeReq, pName, workerId) {
          let call = observer[workerPlaced].getCall(callIdx);
          assert.deepEqual(call.args[0], placeReq);
          assert.equal(call.args[1], pName);
          let board = call.args[2];
          let boardWorkers = [new Worker(placeReq[1], placeReq[2], workerId, pName)];
          assert.deepEqual(board.getWorkers(), boardWorkers);
        }

        return gameState.then(() => {
          // get the worker placement notifier function from 2nd call to notifyAll
          let placeNotifier0 = referee.notifyAllObservers.getCall(1).args[0];

          return placeNotifier0(observer).then(() => {
            return verifyPlaceNotification(0, placeRequest0, p1Id, workerId1);
          });
        });
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
      p1Id = "p1";
      p2Id = "p2";
      player1 = makePlayer(p1Id);
      player2 = makePlayer(p2Id);
      referee = new Referee(player1, player2);

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
          player1.takeTurn = sinon.stub().resolves(turn);

          observer = testLib.createMockObject(turnTaken);
          referee.addObserver(observer);

          gameState = referee.getAndApplyTurn(referee.player1);
        });
        it('applies the player"s turn to the Board', function () {
          return gameState.then(() => {
            let worker = referee.board.findWorker({player:p1Id,id:workerId1});
            assert.equal(worker.posn.x, 0);
            assert.equal(worker.posn.y, 1);
            assert.equal(referee.board.heightAtTile(0,2), 1);
            return;
          });
        });
        it('returns a GameState indicating that the game should continue', function () {
          return expect(gameState).to.eventually.equal(c.GameState.IN_PROGRESS);
        });
        it('notifies the Observer that a turn was taken', function () {
          return gameState.then(() => {
            assert.isTrue(observer[turnTaken].calledOnce);
            let call0Args = observer[turnTaken].getCall(0).args;
            let observerTurn = call0Args[0];
            let observerBoard = call0Args[1];

            assert.deepEqual(observerTurn, turn);
            assert.deepEqual(observerBoard, referee.board);
            return;
          });
        });
      });
      describe('when the Player provides a valid winning Turn', function () {
        beforeEach(function () {
          turn = [["move", { player:p1Id, id:workerId1 }, ["EAST", "SOUTH"]]];
          player1.takeTurn = sinon.stub().resolves(turn);
          gameState = referee.getAndApplyTurn(referee.player1);
        });
        it('applies the player"s turn to the Board', function () {
          return gameState.then(() => {
            // show that the worker moved to the expected location
            let worker = referee.board.findWorker({player:p1Id,id:workerId1});
            assert.equal(worker.posn.x, 1);
            assert.equal(worker.posn.y, 1);
            return;
          });
        });
        it('returns a GameState indicating that the Player has won the game', function () {
          let expectedGameResult = new GameResult(p1Id, p2Id, c.EndGameReason.WON);
          return expect(gameState).to.eventually.deep.equal(expectedGameResult);
        });
      });
      describe('when the Player provides an invalid Turn', function () {
        let boardCopy, observer;
        beforeEach(function () {
          boardCopy = referee.board.copy();
          turn = [["move", { player:p1Id, id:workerId1 }, ["PUT", "PUT"]]];
          player1.takeTurn = sinon.stub().resolves(turn);

          observer = testLib.createMockObject(turnTaken);
          referee.addObserver(observer);

          gameState = referee.getAndApplyTurn(referee.player1);
        });
        it('does not apply the Turn to the Board', function () {
          return gameState.then(() => {
            // Referee's new board is the same as a copy of the board made before turn
            return assert.deepEqual(referee.board, boardCopy);
          });
        });
        it('returns a GameState indicating that the other Player won', function () {
          let expectedGameResult = new GameResult(p2Id, p1Id, c.EndGameReason.BROKEN_RULE)
          return expect(gameState).to.eventually.deep.equal(expectedGameResult);
        });
        it('does not notify the Observer that any turn was taken', function () {
          return gameState.then(() => {
            return assert.isFalse(observer[turnTaken].called);
          });
        })
      });
    });

    describe('checkTurn', function () {
      it('rejects a Turn if it is improperly formed', function () {
        let turn = [["move", 1, 1],["build", []]];
        assert.isFalse(referee.checkTurn(turn, referee.player1));
      });
      it('rejects a Turn where the WorkerRequest does not match the active player', function () {
        let turn = [["move", { player: p2Id, id: workerId1 }, ["EAST", "NORTH"]],
          ["build", ["EAST", "PUT"]]];
        assert.isFalse(referee.checkTurn(turn, referee.player1));
      });
      it('rejects a Turn that is not valid', function () {
        let turn = [["move", { player: p1Id, id: 1 }, ["WEST", "NORTH"]],
          ["build", ["EAST", "PUT"]]];
        assert.isFalse(referee.checkTurn(turn, referee.player1));
      });
      it('accepts a properly formed, correct-player-referencing, valid Turn', function () {
        let turn = [["move", { player: p1Id, id: 1 }, ["EAST", "PUT"]]];
        assert.isTrue(referee.checkTurn(turn, referee.player1));
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
        assert.deepEqual(referee.flip(referee.player1), referee.player2);
        assert.deepEqual(referee.flip(referee.player2), referee.player1);
      });
    });

  describe('Observer handling', function () {
    let referee, player1, player2, p1Id, p2Id, observer1, observer2, mockedMethodName;
    beforeEach(function () {
      p1Id = uuid();
      p2Id = uuid();
      player1 = { name: p1Id, strategy: null };
      player2 = { name: p2Id, strategy: null };
      referee = new Referee(player1, player2, p1Id, p2Id);
    });
    describe('adding and notifying', function () {
      beforeEach(function () {
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

    describe('removing upon failure', function () {
      let observerPromises;
      beforeEach(function () {
        observer1 = testLib.createMockObject('test');
        observer2 = testLib.createMockObject('test');
        observer1.test.returns(Promise.resolve());
        observer2.test.returns(Promise.reject());
        referee.addObserver(observer1);
        referee.addObserver(observer2);
        let notifierFn = (o) => { return o.test() };
        observerPromises = referee.notifyAllObservers(notifierFn);
      });
      it('removes an observer that does not respond as expected', function () {
        return Promise.all(observerPromises).then(() => {
          return assert.deepEqual(referee.observers, [observer1]);
        });
      });
    });
  });
});


