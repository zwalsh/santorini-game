/* Represents an interface for an observer of a game of Santorini.
   When plugged into a Referee or other game-managing component,
   the Referee will dutifully inform it of all events of interest.

   These events include:
   (- the start of a new game (including who is playing))
   (- the start of a new series of n games)
   - each valid Turn and the resulting Board state
   - the end of a game (including the winner and reason)
   (- the end of a series (including the list of game results in the series))
   * Items in parens indicate non-mandatory, potential features

   startGame() must be called before any Turns are reported, and gameOver()
   must be called before a new game can begin. Similarly, startSeries() must
   be called before seriesOver() and seriesOver() must be called before a
   new series can begin. A series cannot be started during the progress
   of a game.

   ------------- Data Definitions -------------

    * A JsonBoard is a: [[Cell, ...], ... ]
    *
    * A Cell is one of:
    *  Height
    *  BuildingWorker
    *
    * Height (H) is a: int from 0 to 4 representing height
    *
    * A BuildingWorker is a: String that starts with a int(height), followed by a string player name,
    *                        and ends with a 1 or 2 - e.g. 'alfred1' or 'alfred2'
    *
    * A JsonTurn is one of:
    *  - [Worker,EastWest,NorthSouth], which represents a winning move
    *  - [Worker,EastWest,NorthSouth,EastWest,NorthSouth], where the first pair of directions after the Worker
    *      represent a move, and the second two represent a build following the move.
*/

const c = require('../Lib/constants');

class Observer {
  constructor() {
    this.playerName1;
    this.playerName2;
  }

  /* String String -> Void
    Indicates to the observer that a new game has started between the
    two Players with the given names.
  */
  startGame(playerName1, playerName2) {
    this.playerName1 = playerName1;
    this.playerName2 = playerName2;
  }

  /* PlaceRequest String Board -> Void
    Tells the observer that the named Player made the given placement
    of a Worker on the Board.
   */
  workerPlaced(placeReq, playerName, resultingBoard) {
    // Ignore the place request and player name here.
    // Convert Board to JSON
    // Print that JSON
  }

  /* Turn String Board -> Void
    Tells the observer that the named Player took the given valid Turn,
    and that it resulted in the given Board state.
   */
  turnTaken(turn, playerName, resultingBoard) {
    // Convert the turn to JSON/string
    // Print that JSON
    // Convert Board to JSON
    // Print that JSON
  }
  /* GameResult -> Void
    This method is called when the game currently in progress comes
    to an end. It passes the result of that game to the Observer.
   */
  gameOver(gameResult) {
    // Convert the GameResult to JSON/string
    // Print that JSON
  }

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
    Turn will be [MoveRequest,BuildRequest] or [MoveRequest]
     * A MoveRequest is a: ["move", WorkerRequest, Direction]
     * A BuildRequest is a: ["build", Direction]
     * A JsonTurn is one of:
    *  - [Worker,EastWest,NorthSouth], which represents a winning move
    *  - [Worker,EastWest,NorthSouth,EastWest,NorthSouth], where the first pair of directions after the Worker
    *      represent a move, and the second two represent a build following the move.
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
    let playerName = gameResult[0];
    let opponentName = playerName === this.playerName1 ? this.playerName2 : this.playerName1;
    let endGameReason = gameResult[1];
    let message = "Player " + playerName + " ";
    switch(endGameReason) {
      case c.EndGameReason.WON:
        message += "won the game!";
        break;
      case c.EndGameReason.BROKEN_RULE:
        message += "won because Player " + opponentName + " broke the rules.";
        break;
      default:
    }
    return message;
  }

  /* JSON -> Void
    Stringify and print the given JSON.
   */
  printJson(json) {
    process.stdout.write(JSON.stringify(json));
  }


  // ---------------- As-yet-unneeded methods -------------------
  // Not necessary for the Assignment 10 observer task.
  // Still debating whether or not to keep them in / add Referee support
  // for them for the future.

  /* String String OddNumber -> Void
    Notifies this observer that a new series has started between the
    two Players with the given names, and that it will be decided by
    the majority of the given number of games.
   */
  startSeries(playerName1, playerName2, numGames) {

  }
  /* [GameResult] -> Void
    When a series reaches its conclusion, the list of GameResults
    that occurred in the series are passed into the Observer via
    this method.
   */
  seriesOver(gameResults) {

  }
}

module.exports = Observer;