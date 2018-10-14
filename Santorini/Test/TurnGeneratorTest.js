/* Unit tests for the TurnGenerator component. */
const TurnGenerator = require('./../Common/TurnGenerator.js');
const Action = require('./../Common/Action.js');
const GameState = require('./../Common/GameState.js');

describe("GameState test suite", function () {

  // Generates all 64 possible next moves for a worker
  describe("when a worker can move and build anywhere", function () {
    it("generates 64 actions for that worker", function () {

    });

    it("generates 64 unique actions", function () {

    });
  });

  // Test gamestate where worker has one possible move build
  // to test transition from having a next move to not having a next move
  describe("when a worker only has one possible move+build", function () {

    it("generates the one possible action", function() {

    });

    it("hasNext() returns true first, then false after next() is called", function () {

    });
  });

  // Test worker has no possible moves in given game board, hasNext() false
  describe("when a worker has no possible moves", function () {

    it("hasNext() returns false immediately", function () {

    });
  });

  // Test with 2 workers, that there are options for both of them
  // (first worker has 1 move only, to get to second worker)
  describe("when there are two workers", function () {

    it("generates all possible actions for the first worker, then the second");
  });

});