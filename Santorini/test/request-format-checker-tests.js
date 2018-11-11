let assert = require('chai').assert;
const RFC = require('../Common/request-format-checker');

describe('Data checking methods', function () {
  describe('isWellFormedTurn', function () {
    describe('rejects improperly formed Turn when it', function () {
      it('is not an Array', function () {
        let turn = {};
        assert.isFalse(RFC.isWellFormedTurn(turn));
      });
      it('is too short', function () {
        let turn = [];
        assert.isFalse(RFC.isWellFormedTurn(turn));
      });
      it('has an improperly formed move', function () {
        let turn = [["move"]];
        assert.isFalse(RFC.isWellFormedTurn(turn));
      });
      it('has an invalid build', function () {
        let turn = [["move", {player:"wayne", id:1}, ["PUT", "SOUTH"]], ["build"]];
        assert.isFalse(RFC.isWellFormedTurn(turn));
      });
    });
    it('accepts properly formed Turn', function () {
      let turn = [["move", {player:"bar", id:1}, ["PUT", "SOUTH"]], ["build", ["PUT", "SOUTH"]]];
      assert.isTrue(RFC.isWellFormedTurn(turn));
    });
  });

  describe('isWellFormedPlaceReq', function () {
    describe('rejects improperly formed PlaceRequest when it', function () {
      it('is not an Array', function () {
        let placeReq = {};
        assert.isFalse(RFC.isWellFormedPlaceReq(placeReq));
      });
      it('is too short', function () {
        let placeReq = ["place"];
        assert.isFalse(RFC.isWellFormedPlaceReq(placeReq));
      });
      it('has the wrong type of data', function () {
        // not "place", first not number, second not number
        let placeReq1 = [3, 2, 3];
        assert.isFalse(RFC.isWellFormedPlaceReq(placeReq1));
        let placeReq2 = ["place", "a", 3];
        assert.isFalse(RFC.isWellFormedPlaceReq(placeReq2));
        let placeReq3 = ["place", 2, 3.3];
        assert.isFalse(RFC.isWellFormedPlaceReq(placeReq3));
      });
    });
    it('accepts properly formed PlaceRequest', function () {
      let placeReq1 = ["place", 2, 3];
      assert.isTrue(RFC.isWellFormedPlaceReq(placeReq1));
    });
  });

  describe('isWellFormedMoveReq', function () {
    describe('rejects improperly formed MoveRequest when it', function () {
      it('is not an Array', function () {
        let moveReq = {};
        assert.isFalse(RFC.isWellFormedMoveReq(moveReq));
      });
      it('is too short', function () {
        let moveReq = ["move"];
        assert.isFalse(RFC.isWellFormedMoveReq(moveReq));
      });
      it('has an improperly formed WorkerRequest', function () {
        let moveReq = ["move", {notPlayer:0}, ["EAST", "PUT"]];
        assert.isFalse(RFC.isWellFormedMoveReq(moveReq));
      });
      it('has an improperly formed Direction', function () {
        let moveReq = ["move", {player:"wayne", id:1}, ["EAST", "I THOUGHT YOU SAID WEAST"]];
        assert.isFalse(RFC.isWellFormedMoveReq(moveReq));
      });
    });
    it('accepts properly formed MoveRequest', function () {
      let moveReq = ["move", {player:"wayne", id:1}, ["PUT", "SOUTH"]];
      assert.isTrue(RFC.isWellFormedMoveReq(moveReq));
    });
  });

  describe('isWellFormedBuildReq', function () {
    describe('rejects improperly formed BuildRequest when it', function () {
      it('is not an Array', function () {
        let buildReq = {};
        assert.isFalse(RFC.isWellFormedBuildReq(buildReq));
      });
      it('is too short', function () {
        let buildReq = ["build"];
        assert.isFalse(RFC.isWellFormedBuildReq(buildReq));
      });
      it('has an improperly formed Direction', function () {
        let buildReq = ["build", ["not", "a", "direction"]];
        assert.isFalse(RFC.isWellFormedBuildReq(buildReq));
      });
    });
    it('accepts properly formed BuildRequest', function () {
      let buildReq = ["build", ["WEST", "PUT"]];
      assert.isTrue(RFC.isWellFormedBuildReq(buildReq));
    });
  });

  describe('isWellFormedWorkerReq', function () {
    describe('rejects improperly formed WorkerRequest when', function () {
      it('is not an Object', function () {
        let workerReq = 0;
        assert.isFalse(RFC.isWellFormedWorkerReq(workerReq));
      });
      it('is missing player or id keys', function () {
        let workerReq1 = {player:"garth", instrument:"bass"};
        assert.isFalse(RFC.isWellFormedWorkerReq(workerReq1));
        let workerReq2 = {shellfish:"scallop", id:9};
        assert.isFalse(RFC.isWellFormedWorkerReq(workerReq2));
      });
      it('has any additional keys', function () {
        let workerReq = {player:"garth", instrument:"bass", id:1};
        assert.isFalse(RFC.isWellFormedWorkerReq(workerReq));
      });
      it('player or id are the wrong type', function () {
        let workerReq1 = {player:"garth", id:"1"};
        assert.isFalse(RFC.isWellFormedWorkerReq(workerReq1));
        let workerReq2 = {player:0, id:1};
        assert.isFalse(RFC.isWellFormedWorkerReq(workerReq2));
      });
    });
    it('accepts properly formed WorkerRequest', function () {
      let workerReq = {player:"garth", id:1};
      assert.isTrue(RFC.isWellFormedWorkerReq(workerReq));
    });
  });
});