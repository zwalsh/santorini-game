let assert = require('chai').assert;
let sinon = require('sinon');
let Board = require('../Common/board');
const c = require('../Lib/constants');
let Observer = require('../Observer/observer');

describe('Observer tests', function () {
  let observer;
  beforeEach(function () {
    observer = new Observer();
  });

  describe('Json conversion methods', function () {

    describe('Turn to JSON', function () {
      let move, build, pName, workerId;
      beforeEach(function () {
        pName = 'garth';
        workerId = 1;
        move = ["move", { player: pName, id: workerId }, ["EAST", "NORTH"]];
        build = ["build", ["WEST", "SOUTH"]];
      });

      it('converts the Worker correctly', function () {
        let turn = [move, build];
        assert.deepEqual(observer.turnToJson(turn)[0], 'garth1');
      });
      it('converts a Move-only turn correctly', function () {
        let turn = [move];
        assert.deepEqual(observer.turnToJson(turn), ['garth1', "EAST", "NORTH"]);
      });
      it('converts a Move-Build turn correctly', function () {
        let turn = [move, build];
        assert.deepEqual(observer.turnToJson(turn), ['garth1', "EAST", "NORTH", "WEST", "SOUTH"]);
      });
    });

  });
});