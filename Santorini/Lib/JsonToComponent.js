/**
 * This module contains a collection of functions useful for
 * converting JSON inputs to components for the Santorini
 * game.
 */

const Board = require('./../Common/Board.js');
const GameState = require('./../Common/GameState.js');
const Action = require('./../Common/Action.js');
const PlaceAction = Action.PlaceAction;
const MoveAction = Action.MoveAction;
const BuildAction = Action.BuildAction;
const Direction = require('./../Common/Direction.js');


/* BoardRequest -> [GameState, Map<Worker,WorkerId>, [String, ...]]
Given a board request of the shape [[Cell, ...], ...],
creates a GameState object, a Map of the worker names to their IDs,
and a list of player names, in order of which player's worker was
encountered first while iterating through the given BoardRequest.
*/
function createGameState(boardReq) {
  let board = new Board();
  let gameState = new GameState(board);
  let playerNameToId = [];
  let workerNameToId = new Map();
  for (let rowIdx = 0; rowIdx < boardReq.length; rowIdx++) {
    let row = boardReq[rowIdx];
    for (let colIdx = 0; colIdx < row.length; colIdx++) {
      let cell = row[colIdx];
      let height;
      if (typeof cell === 'number') {
        height = cell;
      } else {
        height = Number(cell.substring(0, 1));
        let placeAction = new PlaceAction([rowIdx, colIdx]);
        let id = cell.substring(1, cell.length - 1);
        if (playerNameToId.indexOf(id) === -1 && playerNameToId.length < 2) {
          playerNameToId.push(id);
        }
        let playerId = playerNameToId.indexOf(id);
        gameState.whoseTurn = playerId;
        Action.execute(placeAction, gameState);

        let workerName = cell.substring(1);
        workerNameToId.set(workerName, board.getWorkers().length - 1);
      }
      board.heights[rowIdx][colIdx] = height;
    }
  }
  return [gameState, workerNameToId, playerNameToId];
}

/* ["move", Worker, [EastWest, NorthWest]] Map<Worker,WorkerId> GameState -> MoveAction
Creates a MoveAction from the given JSON request and GameState.
Also sets the game state to the correct turn given who is attempting to move.
*/
function createMoveAction(request, workerNameToId, gameState) {
  let workerId = workerNameToId.get(request[1]);
  let location = getLocation(gameState.getBoard(), workerId, createDirection(request[2]));
  gameState.whoseTurn = gameState.getOwner(workerId);
  return new MoveAction(workerId, location);
}


/* ["+build", [EastWest, NorthWest]] WorkerId GameState -> BuildAction
Creates a BuildAction from the given JSON request, WorkerId, and GameState.
Build location is determined for the given worker relative to that
worker's current position in the GameState.
*/
function createBuildAction(request, workerId, gameState) {
  let location = getLocation(gameState.getBoard(), workerId, createDirection(request[1]));
  return new BuildAction(workerId, location);
}

/* [EastWest, NorthWest] -> Direction
  Finds the Direction that matches the given JSON [EastWest, NorthWest].
 */
function createDirection(dir) {
  switch(dir[0]) {
    case "EAST":
      switch(dir[1]) {
        case "NORTH":
          return Direction.NORTHEAST;
        case "SOUTH":
          return Direction.SOUTHEAST;
        case "PUT":
          return Direction.EAST;
        default:
          throw 'Invalid NorthSouth: ' + dir[1];
      }
    case "WEST":
      switch(dir[1]) {
        case "NORTH":
          return Direction.NORTHWEST;
        case "SOUTH":
          return Direction.SOUTHWEST;
        case "PUT":
          return Direction.WEST;
        default:
          throw 'Invalid NorthSouth: ' + dir[1];
      }
    case "PUT":
      switch(dir[1]) {
        case "NORTH":
          return Direction.NORTH;
        case "SOUTH":
          return Direction.SOUTH;
        case "PUT":
          return Direction.STAY;
        default:
          throw 'Invalid NorthSouth: ' + dir[1];
      }
    default:
      throw 'Invalid EastWest: ' + dir[0];
  }
}

/* Board WorkerId Direction -> [Maybe Location]
Given a worker and a direction, produce the location on the
board adjacent to that worker in that direction.
If the resulting location is off the board, return false.
*/
function getLocation(board, workerIdx, dir) {
  let loc = board.getWorker(workerIdx);
  return Direction.adjacentLocation(loc, dir);
}

module.exports = {
  "createGameState": createGameState,
  "createMoveAction": createMoveAction,
  "createBuildAction": createBuildAction,
  "getLocation": getLocation
};
