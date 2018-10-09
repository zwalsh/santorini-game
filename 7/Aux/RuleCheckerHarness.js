/*
This module implements a test harness for integration
testing of the RuleChecker (in Santorini/Common/RuleChecker.js).

Reads in a test scenario as a sequence of JSON arrays
and creates board / checks if actions on the board are valid.
Prints results of each check to stdout.

Expects to receive well-formed and valid JSON. They must come in
a sequence of the following order:
- a Board specification
- a Move request
- optionally, a MoveBuild request

Will print "yes" or "no" as a response to each sequence,
indicating if the given sequence did or did not constitute
a valid move per the RuleChecker.

A Board is [[Cell, ...], ...].

A Cell is one of: a Height or a BuildingWorker Worker.

A Height is one of: 0, 1, 2, 3, 4. It indicates (the height of) a building.

A BuildingWorker is a String that starts with a single digit
followed by a Worker. The first digit represents the Height of the building.

A Worker is a string of lowercase letters that ends in either 1 or 2.
 The last digit indicates whether it is the first or the second worker
 of a player. The lowercase letters are the name of the player that
 owns the worker.

An incomplete row of a Board is filled with trailing, unoccupied Cells.

A Board specification is valid if it has at most six rows
and each row consists of at most six cells. A "short" Board
is supplemented with empty rows. It must also contain exactly
four Workers, two per player.

Then, it is followed by a Move request and optionally by a MoveBuild:

A Move is ["move", Worker, Direction].

A Direction is [EastWest, NorthSouth] where EastWest is one of:
"EAST" "PUT" "WEST"
and NorthSouth is one of:
"NORTH" "PUT" "SOUTH"

A Move is valid if the Worker can step to a physical Cell
in the specified Direction.

A MoveBuild is as follows:
["+build", Direction]

*/

const JsonParser = require('./../../Santorini/Lib/JsonParse.js');
const RuleChecker = require('./../../Santorini/Common/RuleChecker.js');
const Board = require('./../../Santorini/Common/Board.js');
const GameState = require('./../../Santorini/Common/GameState.js');
const Action = require('./../../Santorini/Common/Action.js');
const PlaceAction = Action.PlaceAction;
const MoveAction = Action.MoveAction;
const BuildAction = Action.BuildAction;

let playerNameToId;
let workerNameToId;

process.stdin.on('readable', () => {
  let chunk = process.stdin.read();
  if (chunk != null) {
    let requests = JsonParser.parseInputString(chunk);
    handleRequests(requests);
  }
});

/* Accept a list of incoming requests.
If board is not yet created, create board from the first request.
Otherwise, delegate to appropriate request handler.
*/
function handleRequests(reqs) {
  let gameState;
  let moveAction;
  let buildAction;

  while (reqs.length > 0) {
    req = reqs.splice(0, 1)[0];
    if (req[0] === 'move') {
      /*
      if move, then validate move on game state,
      then check if next req is build,
      if so then pop it and validate build on current gamestate,
      then print && of both validations
      */
      let moveAction = createMoveAction(req, gameState);
      let moveValid = RuleChecker.validate(gameState, moveAction);
      if (reqs.length == 0) {
        process.stdout.write(JSON.stringify(moveValid ? "yes" : "no") + '\n');
        return;
      }
      let next = reqs[0];
      if (next[0] === '+build') {
          req = reqs.splice(0, 1)[0];
          if (!moveValid) {
            process.stdout.write(JSON.stringify("no") + '\n');
            continue;
          }
          Action.execute(moveAction, gameState);

          let buildAction = createBuildAction(req, moveAction.getWorkerId(), gameState);
          let buildValid = RuleChecker.validate(gameState, buildAction);
          process.stdout.write(JSON.stringify(buildValid ? "yes" : "no") + '\n');
      } else {
        process.stdout.write(JSON.stringify(moveValid ? "yes" : "no") + '\n');
      }
    } else {
      gameState = createGameState(req);
    }
  }
}

/* Given a board request of the shape [[Cell, ...], ...],
creates a GameState object.
*/
function createGameState(boardReq) {
  let board = new Board();
  let gameState = new GameState(board);
  playerNameToId = [];
  workerNameToId = new Map();
  for (let rowIdx = 0; rowIdx < boardReq.length; rowIdx++) {
    let row = boardReq[rowIdx];
    for (let colIdx = 0; colIdx < row.length; colIdx++) {
      let cell = row[colIdx];
      let height;
      if (typeof cell == 'number') {
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
  return gameState;
}

/* ["move", Worker, Direction] GameState -> MoveAction
Creates a MoveAction from the given JSON request and GameState.
Also sets the game state to the correct turn given who is attempting to move.
*/
function createMoveAction(request, gameState) {
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


/* Parse the given BuildingWorker string into height and player/worker id,
set the board height at position [row,col],
place that worker onto the board at [row,col],
and record the WorkerId index (returned by the Board)
that is associated with the Worker identifier.
*/
function placeBuildingWorker(board, row, col, bw) {
  let height = bw.substring(0,1);
  let id = bw.substring(1);

  board.heights[row][col] = Number(height);
  let workerIdx = board.addWorker(row,col);
  workers[workerIdx] = id;
}

/* Board WorkerId Direction -> [Maybe Location]
Given a worker and a direction, produce the location on the
board adjacent to that worker in that direction.
If the resulting location is off the board, return false.
*/
function getLocation(board, workerIdx, dir) {
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
  if (loc[0] < 0 || loc[0] >= board.getSize() || loc[1] < 0 || loc[1] >= board.getSize()) {
    return false;
  }
  return loc;
}
