/*
  This module provides functions for converting JSON network messages
  to internal data representations and objects, and vice versa.

  ========== Data Definitions ==========



  JSON:
  - Worker is ...
  - Cell is ...




 */


// ================= X to JSON ==================

/* Board -> [[Cell, ...], ...]
  Convert a Board object to its JSON representation.
*/
function boardToJson(board) {
  let jsonBoard = [];
  let boardHeights = board.getBoard();
  let workers = board.getWorkers();
  for (let y = 0; y < boardHeights.length; y++) {
    let row = [];
    for (let x = 0; x < boardHeights.length; x++) {
      let workerAtSquare = workers.find((w) => { return w.posn.x === x && w.posn.y === y });
      if (workerAtSquare) {
        row.push(workerToJson(workerAtSquare, boardHeights[y][x]));
      } else {
        row.push(boardHeights[y][x]);
      }
    }
    jsonBoard.push(row);
  }
  return jsonBoard;
}

/* Worker Integer -> JSON
  Produces the JSON representation of a Worker as will be included in the JsonBoard,
  including the height of the cell that the Worker is on.
*/
function workerToJson(worker, height) {
  return height + worker.player + worker.id;
}


/* Turn -> Action
  Convert the Turn data to an Action.
 */
function turnToJson(turn) {
  let move = turn[0];
  let worker = move[1].player + move[1].id;
  let jsonTurn = [worker].concat(move[2]);
  if (turn.length === 2) {
    let build = turn[1];
    jsonTurn = jsonTurn.concat(build[1]);
  }
  return jsonTurn;
}


// ================= JSON to X ==================


/* [[Cell, ...] ...] -> Board
  Create a Board object from the given JSON representation.
*/
function jsonToBoard(boardSpec) {
  let workerList = [];
  let initBoard = [];

  if (boardSpec.length < constants.BOARD_HEIGHT) {
    let initHeight = boardSpec.length;
    for (let i = 0; i < constants.BOARD_HEIGHT - initHeight; i++) {
      boardSpec.push([0,0,0,0,0,0]);
    }
  }

  boardSpec.forEach((r) => {
    if (r.length < constants.BOARD_WIDTH) {
      let initWidth = r.length;
      for (let i = 0; i < constants.BOARD_WIDTH - initWidth; i++) {
        r.push(0);
      }
    }
  })

  for (let i = 0; i < boardSpec.length; i++) {
    initBoard.push([]);
    for (let j = 0; j < boardSpec[i].length; j++) {
      if (typeof boardSpec[i][j] === 'number') {
        initBoard[i].push(boardSpec[i][j]);
      } else {
        // TODO: if the rules ever change to allow for more than 9 tiles or 9 workers, we need to change this.
        let height = parseInt(boardSpec[i][j].substring(0, 1));
        let player = boardSpec[i][j].substring(1, boardSpec[i][j].length - 1);
        let id = parseInt(boardSpec[i][j].substring(boardSpec[i][j].length - 1));

        // Swap i and j when making a Worker to conform with coordinate logic
        workerList.push(new Worker(j, i, id, player));
        initBoard[i].push(height);
      }
    }
  }

  return new Board(null, initBoard, workerList);
}

/* Worker -> WorkerRequest
  Convert the string worker representation to a WorkerRequest
 */
function parseWorker(worker) {
  let parsedWorker = worker.split(/[0-9]/);
  let player = parsedWorker[0];
  let id = parseInt(worker.substring(worker.length - 1));

  return {player: player, id: id};
}
