/*
  This module contains constants for all possible Directions in the
  game of Santorini, with some convenient accessors that group them.

  Each direction is a vector that contains the delta from one
  row-col Location on the Board to the Location in the specified
  Direction.

 */

const NORTH = [-1, 0];
const SOUTH = [1, 0];
const EAST = [0, 1];
const WEST = [0, -1];

const NORTHEAST = [-1, 1];
const NORTHWEST = [-1, -1];
const SOUTHEAST = [1, 1];
const SOUTHWEST = [1, -1];

const STAY = [0, 0];

const MOVEMENT_DIRECTIONS = [NORTH, NORTHEAST, EAST, SOUTHEAST, SOUTH, SOUTHWEST, WEST, NORTHWEST];

/* Location Direction -> Location
  Returns the Location adjacent to the given Location in
  the given Direction.
 */
function adjacentLocation(location, direction) {
  return [location[0] + direction[0], location[1] + direction[1]];
}


module.exports = {
  "NORTH": NORTH,
  "SOUTH": SOUTH,
  "EAST": EAST,
  "WEST": WEST,
  "NORTHEAST": NORTHEAST,
  "NORTHWEST": NORTHWEST,
  "SOUTHEAST": SOUTHEAST,
  "SOUTHWEST": SOUTHWEST,
  "STAY": STAY,
  "MOVEMENT_DIRECTIONS": MOVEMENT_DIRECTIONS,
  "adjacentLocation": adjacentLocation
};
