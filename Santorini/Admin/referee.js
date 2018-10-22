const Rulechecker = require('../Common/rulechecker');
const Board = require('../Common/board');
const Direction = require('../Lib/direction');
const c = require('../Lib/constants');

/**

 A Referee controls the flow of the game, maintaining the official
 version of the game state and getting Turns from each player in turn.

 Before applying a player's Turn, the Referee must do the following:
  - ensure the well-formedness of the Turn
  - ensure that the Turn matches the Player that provided it
  - validate the request(s) using the Rulechecker

 After every Turn, the referee checks for endgame conditions, meaning either
 that the Player just reached the winning height, or that it has blocked in
 its opponent.

 If it determines that a player has won the game, it notifies both
 players of the game result.

 A Referee may play one or n games. After each game, it will notify
 each Player of the result of each game. When the game (or games) is/are complete,
 it will return the result, or a length n list of each result in order.

 * ======================== DATA DEFINITIONS ======================
 *
 * A WorkerRequest is a: {player: string , id: int}
 *
 * A PlaceRequest is a: ["place", x:int, y:int]
 *
 * A MoveRequest is a: ["move", WorkerRequest, Direction]
 *
 * A BuildRequest is a: ["build", Direction]
 *
 * A Turn is a [MoveRequest(, BuildRequest)]
 *
 * An InitWorker is a: {player: string, x: int, y: int}
 *
 * An EndGameReason is one of:
 * - "WON"
 * - "BROKEN_RULE"
 * and represents whether a Player won legitimately, or because
 * their opponent broke the rules.
 *
 * A GameResult is a [String, EndGameReason] where the string is
 * the name of the Player who won the game.
 *
 * A GameState is one of:
 * - "IN_PROGRESS"
 * - GameResult
 * and represents a game being in-progress or over.
 *
 */

const RC = new Rulechecker();

// A class to handle the different phases of the game - Initialization, Steady-State, and Game Over
class Referee {

  constructor(player1, player2) {
    // Board holds the state of a game between the 2 players
    this.board = null;
    // The 2 players that will play game(s) against each other
    this.player1 = player1;
    this.player2 = player2;
  }

  /* Void -> GameResult
  Manages a game of Santorini between the two given players.
  Notifies players of game start and end, and returns a GameResult
  representing the winner of the game and the reason they won.
 */
  playGame() {
    this.player1.newGame(this.player2.name);
    this.player2.newGame(this.player1.name);

    let gameState = this.setup();
    let activePlayer = this.player1;
    while (gameState === c.GameState.IN_PROGRESS) {
      gameState = this.getAndApplyTurn(activePlayer);
      activePlayer = this.flip(activePlayer);
    }

    this.player1.notifyGameOver(gameState.slice());
    this.player2.notifyGameOver(gameState.slice());
    return gameState;
  }

  /* PositiveInteger -> [GameResult, ...]
    Manages a given number of games of Santorini between the two given players.
    Returns a list of GameResults representing the winner of the game, and the reason they won.
    If a player breaks the rules in a game, that game is terminated and no further games are played.
   */
  playNGames(numGames) {
    let gameResults = [];
    for (let gameIdx = 0; gameIdx < numGames; gameIdx++) {
      let result = this.playGame();
      gameResults.push(result);
      if (result[1] === c.EndGameReason.BROKEN_RULE) {
        break;
      }
    }
    return gameResults;
  }

  /* Void -> GameState
    Takes two players through the setup state of a Santorini game:
    placing workers on the board. Initializes the board field on this Referee
    with the completed Board, unless a player provides an invalid PlaceRequest.
    In that case, returns a GameResult indicating that the other player won.
   */
  setup() {
    let activePlayer = this.player1;
    let initWorkerList = [];
    let gameState = c.GameState.IN_PROGRESS;
    while (gameState === c.GameState.IN_PROGRESS && initWorkerList.length < c.NUM_WORKERS) {
      let placeReq = activePlayer.placeInitialWorker(Board.copyInitWorkerList(initWorkerList));

      if (this.checkPlaceReq(placeReq, initWorkerList)) {
        let initWorker = {
          player: activePlayer.name,
          x: placeReq[1],
          y: placeReq[2]
        };
        initWorkerList.push(initWorker);
      } else {
        return [this.flip(activePlayer).name, c.EndGameReason.BROKEN_RULE];
      }
      activePlayer = this.flip(activePlayer);
    }
    this.board = new Board(initWorkerList);
    return gameState;
  }

  /* Any -> Boolean
    Return true if the input value is a well-formed PlaceRequest that
    the RuleChecker considers valid.
   */
  checkPlaceReq(placeReq, initWorkerList) {
    return Referee.isWellFormedPlaceReq(placeReq) &&
      RC.isValidPlace(initWorkerList, placeReq[1], placeReq[2]);
  }

  /* Player -> GameState
    Get the given Player's next Turn.
    Apply the Turn to this Referee's Board if it:
      - is well-formed
      - refers to themself and not the other player
      - and is valid according to the Rulechecker
    Otherwise, return a GameResult indicating that the player broke the rules.
   */
  getAndApplyTurn(activePlayer) {
    let turn = activePlayer.takeTurn(this.board.copy());
    if (this.checkTurn(turn, activePlayer)) {
      this.board.applyTurn(turn);
    } else {
      return [this.flip(activePlayer).name, c.EndGameReason.BROKEN_RULE];
    }

    if (RC.hasWon(this.board, activePlayer.name) || RC.hasLost(this.board, this.flip(activePlayer).name)) {
      return [activePlayer.name, c.EndGameReason.WON];
    } else {
      return c.GameState.IN_PROGRESS;
    }
  }

  /* Any Player -> Boolean
    Return true if the input value is a Turn that can be used by the Referee:
    well-formed, refers to the right Player, and valid per the Rulechecker.
   */
  checkTurn(turn, activePlayer) {
    return Referee.isWellFormedTurn(turn) &&
      turn[0][1].player === activePlayer.name &&
      RC.isValidTurn(this.board, turn);
  }

  /* Player -> Player
    Switches the active player.
   */
  flip(activePlayer) {
    return activePlayer === this.player1 ? this.player2 : this.player1;
  }

  /* Any -> Boolean
    Return true if the input is a well-formed Turn.
   */
  static isWellFormedTurn(turn) {
    if (!Array.isArray(turn)) {
      return false;
    }
    if (turn.length === 1) {
      return Referee.isWellFormedMoveReq(turn[0]);
    }
    if (turn.length === 2) {
      return Referee.isWellFormedMoveReq(turn[0]) &&
        Referee.isWellFormedBuildReq(turn[1]);
    }
    return false;
  }

  /* Any -> Boolean
    Return true if the input is a well-formed PlaceRequest.
    PlaceRequest: ["place", x:Int, y:Int]
   */
  static isWellFormedPlaceReq(req) {
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
  static isWellFormedMoveReq(req) {
    return Array.isArray(req) &&
      req.length === 3 &&
      req[0] === "move" &&
      Referee.isWellFormedWorkerReq(req[1]) &&
      Direction.isDirection(req[2]);
  }

  /* Any -> Boolean
    Return true if the input is a well-formed MoveRequest.
    BuildRequest: ["build", Direction]
  */
  static isWellFormedBuildReq(req) {
    return Array.isArray(req) &&
      req.length === 2 &&
      req[0] === "build" &&
      Direction.isDirection(req[1]);
  }

  /* Any -> Boolean
    Return true if the input is a well-formed WorkerRequest.
    WorkerRequest: { player:String, id:Int }
   */
  static isWellFormedWorkerReq(req) {
    let keys = Object.keys(req);
    return keys.length === 2 &&
      keys.includes('player') &&
      typeof req.player === 'string' &&
      keys.includes('id') &&
      Number.isInteger(req.id);
  }
}

module.exports = Referee;