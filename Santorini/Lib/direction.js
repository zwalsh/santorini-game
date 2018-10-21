/**
 * Data Definitions:
 *
 * A Direction is a: [EastWest, NorthSouth]
 * A EastWest is one of: "EAST" "PUT" "WEST"
 * A NorthSouth is one of: "NORTH" "PUT" "SOUTH".
 *
 * A Posn is a: {x:int, y:int}
 */

// Establishes the various possible directional inputs that are relative to a worker.
let directions = {
  WESTNORTH:{x:-1, y:-1},
  WESTPUT: {x:-1, y:0},
  WESTSOUTH: {x:-1, y:1},
  PUTSOUTH: {x:0, y:1},
  EASTSOUTH:{x:1, y:1},
  EASTPUT: {x:1, y:0},
  EASTNORTH: {x:1, y:-1},
  PUTNORTH: {x:0, y:-1},
  PUTPUT: {x:0, y:0}
};

module.exports.directions = directions;

const EAST = "EAST";
const WEST = "WEST";
const NORTH = "NORTH";
const SOUTH = "SOUTH";
const PUT = "PUT";

module.exports.EAST = EAST;
module.exports.WEST = WEST;
module.exports.NORTH = NORTH;
module.exports.SOUTH = SOUTH;
module.exports.PUT = PUT;

// Returns the target tile posn in the given direction of the given x/y
// Direction Int Int -> Posn
module.exports.directionToCoordinate = function (direction, x, y) {
  let d = directions[direction.join('')];
  return {x:d.x+x, y:d.y+y};
};

// Returns a Direction associated with the given posn
// Posn -> Direction
module.exports.coordToDirection = function (posn) {
  let out = [];

  if (posn.x < 0) {
    out.push(WEST);
  } else if (posn.x > 0) {
    out.push(EAST);
  } else {
    out.push(PUT);
  }

  if (posn.y < 0) {
    out.push(NORTH);
  } else if (posn.y > 0) {
    out.push(SOUTH);
  } else {
    out.push(PUT);
  }

  return out;
};

/* Any -> Boolean
  Return true if the value is a Direction
 */
module.exports.isDirection = function (val) {
  return Array.isArray(val) &&
    val.length === 2 &&
    val[0] in [EAST, WEST, PUT] &&
    val[1] in [NORTH, SOUTH, PUT];
};