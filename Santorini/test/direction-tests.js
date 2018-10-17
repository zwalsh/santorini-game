let assert = require('chai').assert;
let Direction = require('../Lib/direction');

describe('direction', function() {

  describe('directionToCoordinate', function() {
    it('should return valid target posn', function() {
      let result1 = Direction.directionToCoordinate(["WEST", "NORTH"], 3, 3);
      let result2 = Direction.directionToCoordinate(["EAST", "SOUTH"], 3, 3);
      let result3 = Direction.directionToCoordinate(["EAST", "PUT"], 3, 3);
      assert.isTrue(result1.x === 2 && result1.y === 2);
      assert.isTrue(result2.x === 4 && result2.y === 4);
      assert.isTrue(result3.x === 4 && result3.y === 3);
      assert.isFalse(result1.x === 2 && result1.y === 6);
    });
  });

  describe('coordToDirection', function() {
    it('should return valid Direction', function() {
      let posn1 = {x: -1, y: -1};
      let posn2 = {x: 1, y: 0};
      let posn3 =  {x: 1, y: 1};
      let posn4 =  {x: 0, y: 0};
      let direction1 = Direction.coordToDirection(posn1);
      let direction2 = Direction.coordToDirection(posn2);
      let direction3 = Direction.coordToDirection(posn3);
      let direction4 = Direction.coordToDirection(posn4);

      assert.isTrue(direction1[0] === 'WEST' && direction1[1] === 'NORTH');
      assert.isTrue(direction2[0] === 'EAST' && direction2[1] === 'PUT');
      assert.isTrue(direction3[0] === 'EAST' && direction3[1] === 'SOUTH');
      assert.isTrue(direction4[0] === 'PUT' && direction4[1] === 'PUT');
      assert.isFalse(direction3[0] === 'PUT' && direction3[1] === 'SOUTH');
    });
  });
});

