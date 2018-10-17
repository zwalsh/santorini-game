let assert = require('chai').assert;
let Worker = require('../Common/worker')


describe('Worker Tests', function() {
  let worker1 = new Worker(2, 3, 1, "sampson")
  describe('isOnTile', function() {
    it('should return true if on {x:2, y:3}', function() {
      assert.isTrue(worker1.isOnTile(2, 3));
      assert.isFalse(worker1.isOnTile(1, 3));
    });
  });

  describe('setPosn', function() {
    it('should change posn', function() {
      assert(worker1.posn.x === 2 && worker1.posn.y === 3);
      worker1.setPosn(0, 0);
      assert(worker1.posn.x === 0 && worker1.posn.y === 0);
    });
  });
});