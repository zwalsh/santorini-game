const assert = require('chai').assert;
const sinon = require('sinon');
const Board = require('../Common/board');
const constants = require('../Common/constants');
const Observer = require('../Observer/observer');
const Worker = require('../Common/worker');
const GameResult = require('../Common/game-result');

describe('Observer tests', function () {
  let observer;
  beforeEach(function () {
    observer = new Observer();
  });

  // Note on Observer unit tests:
  // workerPlaced, turnTaken, and gameOver methods simply call their corresponding
  // JSON conversion methods on their input data, and send
  // the results to printJson().
  // printJson() stringifies its input and writes it to process.stdout,
  // which is not a meaningful behavior to test.
  // Therefore the only meaningful unit tests for this module are the JSON
  // conversion methods themselves, below.
  describe('GameResult to JSON', function () {
    let p1Name, p2Name;
    beforeEach(function () {
      p1Name = "wayne";
      p2Name = "garth";
      observer.startGame(p1Name, p2Name);
    });
    it('outputs the winner\'s name if they won the game cleanly', function () {
      let gameResult = new GameResult(p1Name, p2Name, constants.EndGameReason.WON);
      assert.deepEqual(observer.gameResultToJson(gameResult), "Player wayne won the game!");
    });
    it('outputs the winner\'s name and the opponent\'s name if the opponent broke a rule', function () {
      let gameResult = new GameResult(p2Name, p1Name, constants.EndGameReason.BROKEN_RULE);
      assert.deepEqual(observer.gameResultToJson(gameResult), "Player garth won because Player wayne broke the rules.");
    });
  });

});