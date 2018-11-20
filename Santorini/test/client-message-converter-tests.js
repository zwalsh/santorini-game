const chai = require('chai');
const assert = chai.assert;

const Board = require('../Common/board');
const Worker = require('../Common/worker');

const MessageConverter = require('../Remote/client-message-converter');

describe('MessageConverter tests', function () {
  describe('Turn to JSON', function () {
    let move, build, pName, workerId;
    beforeEach(function () {
      pName = 'garth';
      workerId = 1;
      move = ["move", {player: pName, id: workerId}, ["EAST", "NORTH"]];
      build = ["build", ["WEST", "SOUTH"]];
    });

    it('converts the Worker correctly', function () {
      let turn = [move, build];
      assert.deepEqual(MessageConverter.turnToJson(turn)[0], 'garth1');
    });
    it('converts a Move-only turn correctly', function () {
      let turn = [move];
      assert.deepEqual(MessageConverter.turnToJson(turn), ['garth1', "EAST", "NORTH"]);
    });
    it('converts a Move-Build turn correctly', function () {
      let turn = [move, build];
      assert.deepEqual(MessageConverter.turnToJson(turn), ['garth1', "EAST", "NORTH", "WEST", "SOUTH"]);
    });
  });
});