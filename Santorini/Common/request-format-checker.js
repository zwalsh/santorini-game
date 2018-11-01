/**
 * This file contains functions used to check the well-formedness
 * of data that may be provided by external components, such as a Player.
 *
 * This includes:
 *  - PlaceRequest
 *  - MoveRequest
 *  - BuildRequest
 *  - Turn
 *  - WorkerRequest
 *
 */

const Direction = require('./direction');
/* Any -> Boolean
  Return true if the input is a well-formed Turn.
 */
function isWellFormedTurn(turn) {
  if (!Array.isArray(turn)) {
    return false;
  }
  if (turn.length === 1) {
    return isWellFormedMoveReq(turn[0]);
  }
  if (turn.length === 2) {
    return isWellFormedMoveReq(turn[0]) &&
      isWellFormedBuildReq(turn[1]);
  }
  return false;
}

/* Any -> Boolean
  Return true if the input is a well-formed PlaceRequest.
  PlaceRequest: ["place", x:Int, y:Int]
 */
function isWellFormedPlaceReq(req) {
  return Array.isArray(req) &&
    req.length === 3 &&
    req[0] === "place" &&
    Number.isInteger(req[1]) &&
    Number.isInteger(req[2]);
}

/* Any -> Boolean
Return true if the input is a well-formed MoveRequest.
MoveRequest: ["move", WorkerRequest, Direction]
*/
function isWellFormedMoveReq(req) {
  return Array.isArray(req) &&
    req.length === 3 &&
    req[0] === "move" &&
    isWellFormedWorkerReq(req[1]) &&
    Direction.isDirection(req[2]);
}

/* Any -> Boolean
  Return true if the input is a well-formed MoveRequest.
  BuildRequest: ["build", Direction]
*/
function isWellFormedBuildReq(req) {
  return Array.isArray(req) &&
    req.length === 2 &&
    req[0] === "build" &&
    Direction.isDirection(req[1]);
}

/* Any -> Boolean
  Return true if the input is a well-formed WorkerRequest.
  WorkerRequest: { player:String, id:Int }
 */
function isWellFormedWorkerReq(req) {
  let keys = Object.keys(req);
  return keys.length === 2 &&
    keys.includes('player') &&
    typeof req.player === 'string' &&
    keys.includes('id') &&
    Number.isInteger(req.id);
}


module.exports = {
  'isWellFormedTurn' : isWellFormedTurn,
  'isWellFormedPlaceReq' : isWellFormedPlaceReq,
  'isWellFormedMoveReq' : isWellFormedMoveReq,
  'isWellFormedBuildReq' : isWellFormedBuildReq,
  'isWellFormedWorkerReq' : isWellFormedWorkerReq
};
