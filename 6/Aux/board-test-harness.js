/*
Script to enable testing the Board module for a Santorini game.
Reads in a test scenario as a sequence of JSON arrays
and creates board / executes actions on the board as directed
by those commands.
Prints results of each action as JSON to stdout.

This test harness expects the first JSON input to be a
board creation request, and all subsequent requests to be
move, build, occupy, neighbor, or height actions/queries.

*/

const Board = require('./../../Santorini/Common/board.js');
const Parser = require('./../../Santorini/Lib/JsonParse.js');

let board = null;
let size;
let workers = [];

process.stdin.on('readable', () => {
  let chunk = process.stdin.read();
  if (chunk != null) {
    //console.log("Received chunk: " + chunk);
    let requests = Parser.parseInputString(chunk);
    handleRequests(requests);
  }
});

/* Accept a list of incoming requests.
If board is not yet created, create board from the first request.
Otherwise, delegate to appropriate request handler.
*/
function handleRequests(reqs) {
  if (board === null) {
    createBoard(reqs.splice(0,1)[0]);
    //console.log('Board created: ' + board);
  }
  for (let req of reqs) {
    handleRequest(req);
  }
}

/* Based on the request type, delegate to the appropriate handler
to complete the action on the board.
Prints the result of the request.
*/
function handleRequest(req) {
  let type = req.splice(0,1)[0];
  let response;
  switch(type) {
    case "move":
      response = move(req);
      break;
    case "build":
      response = build(req);
      break;
    case "neighbors":
      response = neighbors(req);
      break;
    case "occupied?":
      response = occupied(req);
      break;
    case "height":
      response = height(req);
      break;
    default:
      throw "Unsupported request type: " + type;
  }
  process.stdout.write(JSON.stringify(response) + "\n");
}

/* Given a board request of the shape [[Cell, ]]
*/
function createBoard(boardReq) {
  board = new Board();
  for (let rowIdx = 0; rowIdx < boardReq.length; rowIdx++) {
    let row = boardReq[rowIdx];
    for (let colIdx = 0; colIdx < row.length; colIdx++) {
      let cell = row[colIdx];
      if (typeof cell == 'number') {
        board.heights[rowIdx][colIdx] = cell;
      } else {
        placeBuildingWorker(rowIdx, colIdx, cell);
      }
    }
  }
  size = board.getSize();
  //console.log(JSON.stringify(board.heights));
}

/* Parse the given BuildingWorker string into height and player/worker id,
set the board height at position [row,col],
place that worker onto the board at [row,col],
and record the WorkerId index (returned by the Board)
that is associated with the Worker identifier.
*/
function placeBuildingWorker(row, col, bw) {
  let height = bw.substring(0,1);
  let id = bw.substring(1);

  board.heights[row][col] = Number(height);
  let workerIdx = board.addWorker(row,col);
  workers[workerIdx] = id;
  //console.log(`Placed building worker at ${row},${col} with id ${id}=${workerIdx}`)
}

/* Given a 'move' request, move the given worker
on the board in the given direction, if the move is possible.
Returns the empty array.
*/
function move(req) {
  let workerId = req[0];
  let dir = req[1];

  let workerIdx = workers.indexOf(workerId);
  let loc = getLocation(workerIdx, dir);

  board.moveWorker(workerIdx, loc[0], loc[1]);
  return [];
}

/* Given a 'build' request, build a floor on the cell
next to the given worker in the given direction,
if possible.
Returns the empty array.
*/
function build(req) {
  let workerId = req[0];
  let dir = req[1];

  let workerIdx = workers.indexOf(workerId);
  let loc = getLocation(workerIdx, dir);

  board.buildFloor(workerIdx, loc[0], loc[1]);
  return [];
}

/* Given a 'neighbors' request, return "yes" or "no"
if there is a cell on the board next to the
given worker in the given direction.
*/
function neighbors(req) {
  let worker = req[0];
  let dir = req[1];

  let workerIdx = workers.indexOf(worker);
  let loc = getLocation(workerIdx, dir);

  return loc !== false ? "yes" : "no";
}

/* Given an 'occupied' request, return "yes" if there is
another worker in the cell next to the given Worker
in the given Direction. Otherwise, return "no".

*/
function occupied(req) {
  let worker = req[0];
  let dir = req[1];

  let workerIdx = workers.indexOf(worker);
  let loc = getLocation(workerIdx, dir);
  //console.log(`Worker ID: ${worker}, location: ${loc}`)

  let workerLocs = board.getWorkers();
  for (let workerLoc of workerLocs) {
    if (workerLoc[0] == loc[0] && workerLoc[1] == loc[1]) {
      return "yes";
    }
  }
  return "no";
}

/* Given a 'height' request, return the height of that
cell in the given direction from the given worker.
*/
function height(req) {
  let worker = req[0];
  let dir = req[1];

  let workerIdx = workers.indexOf(worker);
  let loc = getLocation(workerIdx, dir);

  return board.heights[loc[0]][loc[1]];
}

/* WorkerId Direction -> [Maybe Location]
Given a worker and a direction, produce the location on the
board adjacent to that worker in that direction.
If the resulting location is off the board, return false.
*/
function getLocation(workerIdx, dir) {
  let loc = board.getWorker(workerIdx);
  switch(dir[0]) {
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
  switch(dir[1]) {
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
  //console.log("Determined coordinate: " + loc);
  if (loc[0] < 0 || loc[0] >= size || loc[1] < 0 || loc[1] >= size) {
    return false;
  }
  return loc;
}
