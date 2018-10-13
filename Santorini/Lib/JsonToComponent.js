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


/* BoardRequest -> [GameState, Map<Worker, WorkerId>]
Given a board request of the shape [[Cell, ...], ...],
creates a GameState object, and a Map of the worker names to their IDs
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
        if (playerNameToId.length < 2) {
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
  return [gameState, workerNameToId];
}

/* ["move", Worker, Direction] GameState -> MoveAction
Creates a MoveAction from the given JSON request and GameState.
Also sets the game state to the correct turn given who is attempting to move.
*/
function createMoveAction(request, workerNameToId, gameState) {
  let workerId = workerNameToId.get(request[1]);
  let location = getLocation(gameState.getBoard(), workerId, request[2]);
  gameState.whoseTurn = gameState.getOwner(workerId);
  return new MoveAction(workerId, location);
}


/* ["+build", Direction] WorkerId GameState -> BuildAction
*/
function createBuildAction(request, workerId, gameState) {
  let location = getLocation(gameState.getBoard(), workerId, request[1]);
  return new BuildAction(workerId, location);
}


/* Board WorkerId Direction -> [Maybe Location]
Given a worker and a direction, produce the location on the
board adjacent to that worker in that direction.
If the resulting location is off the board, return false.
*/
function getLocation(board, workerIdx, dir) {
  let loc = board.getWorker(workerIdx);
  switch (dir[0]) {
    case "EAST":
      loc[1] = loc[1] + 1;
      break;
    case "WEST":
      loc[1] = loc[1] - 1;
      break;
    case "PUT":
      break;
    default:
      throw `Invalid Direction: ${dir}`;
  }
  switch (dir[1]) {
    case "NORTH":
      loc[0] = loc[0] - 1;
      break;
    case "SOUTH":
      loc[0] = loc[0] + 1;
      break;
    case "PUT":
      break;
    default:
      throw `Invalid Direction: ${dir}`;
  }
  if (loc[0] < 0 || loc[0] >= board.getSize() || loc[1] < 0 || loc[1] >= board.getSize()) {
    return false;
  }
  return loc;
}

module.exports = {
  "createGameState": createGameState,
  "createMoveAction": createMoveAction,
  "createBuildAction": createBuildAction,
  "getLocation": getLocation
};
