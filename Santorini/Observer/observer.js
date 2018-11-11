/* Implements a Santorini observer that prints game information to stdout.

   ------------- Implementation-Specific Data Definitions -------------

   A JsonBoard is a: [[Cell, ...], ... ]

   A Cell is one of:
    Height
    BuildingWorker

   Height (H) is a: int from 0 to 4 representing height

   A BuildingWorker is a: String that starts with a int(height), followed by a string player name,
                          and ends with a 1 or 2 - e.g. 'alfred1' or 'alfred2'

   A JsonTurn is one of:
    - [Worker,EastWest,NorthSouth], which represents a winning move
    - [Worker,EastWest,NorthSouth,EastWest,NorthSouth], where the first pair of directions after the Worker
        represent a move, and the second two represent a build following the move.
*/

const c = require('../Common/constants');

class Observer {
  constructor() {
  }

  // ================ Observer interface methods ==================

  /* String String -> Promise<Void>
    Indicates to the observer that a new game has started between the
    two Players with the given names.
  */
  startGame(playerName1, playerName2) {
    return Promise.resolve();
  }

  /* PlaceRequest String Board -> Promise<Void>
    Tells the observer that the named Player made the given placement
    of a Worker on the Board.
   */
  workerPlaced(placeReq, playerName, resultingBoard) {
    return new Promise(resolve => {
      this.printJson(this.boardToJson(resultingBoard));
      return resolve();
    });
  }

  /* Turn Board -> Promise<Void>
    Tells the observer that the named Player took the given valid Turn,
    and that it resulted in the given Board state.
   */
  turnTaken(turn, resultingBoard) {
    return new Promise(resolve => {
      this.printJson(this.turnToJson(turn));
      this.printJson(this.boardToJson(resultingBoard));
      return resolve();
    });
  }
  /* GameResult -> Promise<Void>
    This method is called when the game currently in progress comes
    to an end. It passes the result of that game to the Observer.
   */
  gameOver(gameResult) {
    return new Promise(resolve => {
      this.printJson(this.gameResultToJson(gameResult));
      return resolve();
    });
  }

  /* String String OddNumber -> Promise<Void>
    No-op
   */
  startSeries(playerName1, playerName2, numGames) {
    return Promise.resolve();
  }

  /* Match -> Promise<Void>
    No-op
   */
  seriesOver(match) {
    return Promise.resolve();
  }

  // ================ Helpers ==================

  /* Board -> JsonBoard
    Convert the Board object to a JSON representation.
   */
  boardToJson(board) {
    let jsonBoard = [];
    let boardHeights = board.getBoard();
    let workers = board.getWorkers();
    for (let y = 0; y < boardHeights.length; y++) {
      let row = [];
      for (let x = 0; x < boardHeights.length; x++) {
        let workerAtSquare = workers.find((w) => { return w.posn.x === x && w.posn.y === y });
        if (workerAtSquare) {
          row.push(this.workerToJson(workerAtSquare, boardHeights[y][x]));
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
  workerToJson(worker, height) {
    return height + worker.player + worker.id;
  }

  /* Turn -> JsonTurn
    Convert the Turn data to an informative, printable representation.
   */
  turnToJson(turn) {
    let move = turn[0];
    let worker = move[1].player + move[1].id;
    let jsonTurn = [worker].concat(move[2]);
    if (turn.length === 2) {
      let build = turn[1];
      jsonTurn = jsonTurn.concat(build[1]);
    }
    return jsonTurn;
  }

  /* GameResult -> String
    Convert the GameResult to an informative printable representation
   */
  gameResultToJson(gameResult) {
    let message = "Player " + gameResult.winner + " ";
    switch(gameResult.reason) {
      case c.EndGameReason.WON:
        message += "won the game!";
        break;
      case c.EndGameReason.BROKEN_RULE:
        message += "won because Player " + gameResult.loser + " broke the rules.";
        break;
      default:
    }
    return message;
  }

  /* JSON -> Void
    Stringify and print the given JSON.
   */
  printJson(json) {
    process.stdout.write(JSON.stringify(json) + '\n');
  }
}

module.exports = Observer;