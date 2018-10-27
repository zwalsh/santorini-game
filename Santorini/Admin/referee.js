const Rulechecker = require('../Common/rulechecker');
const Board = require('../Common/board');
const RFC = require('../Lib/request-format-checker');
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
 * A GameResult is a [UUID, EndGameReason] where the UUID is
 * the identifier of the Player who won the game.
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
  /* Player Player UUID UUID -> Referee
    Construct a Referee to run game(s) between the given Players.
    This Referee will use the given GUIDs to identify the Players as needed
    internally, as well as in Board and Turn data it sends to other components.
   */
  constructor(player1, player2, p1Id, p2Id) {
    // Board holds the state of a game between the 2 players
    this.board = null;
    // The 2 players that will play game(s) against each other
    this.player1 = player1;
    this.player2 = player2;
    // The UUID assigned to each player, respectively
    this.p1Id = p1Id;
    this.p2Id = p2Id;
    // List of Observers registered on this Referee.
    // Observers are trusted components that are given
    // references to essential game data (as opposed to copies).
    this.observers = [];
  }

  /* Void -> GameResult
  Manages a game of Santorini between the two given players.
  Notifies players of game start and end, and returns a GameResult
  representing the winner of the game and the reason they won.
  Cleanup: Reset referee board to null after the game is over.
 */
  playGame() {
    this.player1.newGame(this.p1Id, this.p2Id);
    this.player2.newGame(this.p2Id, this.p1Id);

    this.notifyAllObservers(o => { o.startGame(this.p1Id, this.p2Id) });

    let gameState = this.setup();
    let activePlayer = this.player1;
    while (gameState === c.GameState.IN_PROGRESS) {
      gameState = this.getAndApplyTurn(activePlayer);
      activePlayer = this.flip(activePlayer);
    }

    this.player1.notifyGameOver(gameState.slice());
    this.player2.notifyGameOver(gameState.slice());

    this.notifyAllObservers(o => { o.gameOver(gameState) });

    this.board = null;
    return gameState;
  }

  /* PositiveInteger -> [GameResult, ...]
    Manages a given number of games of Santorini between the two given players.
    Returns a list of GameResults representing the winner of the game, and the reason they won.
    If a player breaks the rules in a game, that game is terminated and no further games are played.
    The number of games in the series must be odd, or the behavior of this method is undefined.
   */
  playNGames(numGames) {
    this.notifyAllObservers(o => { o.startSeries(this.p1Id, this.p2Id, numGames) });

    let gameResults = [];
    let seriesState = c.GameState.IN_PROGRESS;
    while (seriesState === c.GameState.IN_PROGRESS) {
      let result = this.playGame();
      gameResults.push(result);
      if (result[1] === c.EndGameReason.BROKEN_RULE) {
        seriesState = result;
      } else {
        seriesState = this.getSeriesStatus(gameResults, numGames);
      }
    }
    this.notifyAllObservers(o => { o.seriesOver(gameResults) });
    return gameResults;
  }

  /* [GameResult, ...] Natural -> GameResult
    Given the length of a series, determine if more than half of the
    games in the series have been won by one player.
  */
  getSeriesStatus(gameResults, numGames) {
    let p1WinCount = gameResults
      .filter(gameResult => (gameResult[0] === this.p1Id))
      .length;
    let p2WinCount = gameResults.length - p1WinCount;
    if (p1WinCount > numGames / 2) {
      return [this.p1Id, c.EndGameReason.WON];
    } else if (p2WinCount > numGames / 2) {
      return [this.p2Id, c.EndGameReason.WON];
    } else {
      return c.GameState.IN_PROGRESS
    }
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
          player: this.playerId(activePlayer),
          x: placeReq[1],
          y: placeReq[2]
        };
        initWorkerList.push(initWorker);

        this.notifyAllObservers(o => { o.workerPlaced(placeReq, this.playerId(activePlayer), new Board(initWorkerList)) });
      } else {
        return [this.playerId(this.flip(activePlayer)), c.EndGameReason.BROKEN_RULE];
      }
      activePlayer = this.flip(activePlayer);
    }
    this.board = new Board(initWorkerList);
    return gameState;
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

      this.notifyAllObservers(o => { o.turnTaken(turn, this.board) });
    } else {
      return [this.playerId(this.flip(activePlayer)), c.EndGameReason.BROKEN_RULE];
    }

    if (RC.hasWon(this.board, this.playerId(activePlayer)) || RC.hasLost(this.board, this.playerId(this.flip(activePlayer)))) {
      return [this.playerId(activePlayer), c.EndGameReason.WON];
    } else {
      return c.GameState.IN_PROGRESS;
    }
  }

  /* Any -> Boolean
    Return true if the input value is a well-formed PlaceRequest that
    the RuleChecker considers valid.
   */
  checkPlaceReq(placeReq, initWorkerList) {
    return RFC.isWellFormedPlaceReq(placeReq) &&
      RC.isValidPlace(initWorkerList, placeReq[1], placeReq[2]);
  }


  /* Any Player -> Boolean
    Return true if the input value is a Turn that can be used by the Referee:
    well-formed, refers to the right Player, and valid per the Rulechecker.
   */
  checkTurn(turn, activePlayer) {
    return RFC.isWellFormedTurn(turn) &&
      turn[0][1].player === this.playerId(activePlayer) &&
      RC.isValidTurn(this.board, turn);
  }

  /* Player -> Player
    Switches the active player.
   */
  flip(activePlayer) {
    return activePlayer === this.player1 ? this.player2 : this.player1;
  }
  
  /* Player -> UUID
    Get the UUID that this Referee has associated with the given Player.
   */
  playerId(activePlayer) {
    return activePlayer === this.player1 ? this.p1Id : this.p2Id;
  }

  /* [Observer -> Void] -> Void
    Notifies all observers in the list using the given notifier function.
  */
  notifyAllObservers(notifier) {
    this.observers.forEach((o) => notifier(o));
  }

  /* Observer -> Void
    Add the given observer to the set of Observers that this Referee notifies of events.
  */
  addObserver(observer) {
    this.observers.push(observer);
  }
}

module.exports = Referee;