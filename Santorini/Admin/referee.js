const Rulechecker = require('../Common/rulechecker');
const Board = require('../Common/board');
const RFC = require('../Lib/request-format-checker');
const GuardedPlayer = require('./guarded-player');
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
  constructor(player1, player2, p1Id, p2Id, timeout) {
    // Board holds the state of a game between the 2 players
    this.board = null;
    // The 2 players that will play game(s) against each other
    this.player1 = new GuardedPlayer(player1, timeout);
    this.player2 = new GuardedPlayer(player2, timeout);
    // The UUID assigned to each player, respectively
    this.p1Id = p1Id;
    this.p2Id = p2Id;
    // List of Observers registered on this Referee.
    // Observers are trusted components that are given
    // references to essential game data (as opposed to copies).
    this.observers = [];
  }

  /* Void -> Promise<GameResult>
  Manages a game of Santorini between the two given players.
  Notifies players of game start and end, and returns a Promise that resolves to a GameResult
  representing the winner of the game and the reason they won.
  Cleanup: Resets referee board to null after the game is over.
 */
  playGame() {
    let playersNotifiedOfStart = this.player1.newGame(this.p1Id, this.p2Id).then(() => {
      return this.player2.newGame(this.p2Id, this.p1Id);
    });

    let gameSetUp = playersNotifiedOfStart.then(() => {
      this.notifyAllObservers(o => { o.startGame(this.p1Id, this.p2Id) });
      return this.setup();
    });

    let gamePlayed = gameSetUp.then((gameState) => {
      if (gameState !== c.GameState.IN_PROGRESS) {
        return gameState;
      } else {
        return this.completePlayGame(this.player1);
      }
    });

    let playersNotifiedOfEnd = gamePlayed.then((gameResult) => {
      let p1Notified = this.player1.notifyGameOver(gameResult.slice());

      let p2Notified = p1Notified.then(() => {
        return this.player2.notifyGameOver(gameResult.slice());
      });

      let observersNotified = p2Notified.then(() => {
        this.notifyAllObservers(o => { o.gameOver(gameResult) });
        this.board = null;
        return gameResult;
      });

      return observersNotified;
    });

    return playersNotifiedOfEnd;
  }

  /* Player -> Promise<GameResult>
    Given the current active player, play the game to completion.
   */
  completePlayGame(activePlayer) {
    return this.getAndApplyTurn(activePlayer).then((gameState) => {
      if (gameState === c.GameState.IN_PROGRESS) {
        return this.completePlayGame(this.flip(activePlayer));
      } else {
        return gameState;
      }
    });
  }

  /* PositiveInteger -> Promise<[GameResult, ...]>
    Manages a given number of games of Santorini between the two given players.
    Returns a list of GameResults representing the winner of the game, and the reason they won.
    If a player breaks the rules in a game, that game is terminated and no further games are played.
    The number of games in the series must be odd, or the behavior of this method is undefined.
   */
  playNGames(numGames) {
    this.notifyAllObservers(o => { o.startSeries(this.p1Id, this.p2Id, numGames) });

    return this.completePlayNGames(numGames, []).then((gameResults) => {
      this.notifyAllObservers(o => { o.seriesOver(gameResults) });
      return gameResults;
    });
  }

  /* PositiveInteger [GameResult, ...] -> Promise<[GameResult, ...]>

   */
  completePlayNGames(numGames, gameResults) {
    return this.playGame().then((result) => {
      gameResults.push(result);
      if (result[1] === c.EndGameReason.BROKEN_RULE) {
        return gameResults;
      }
      let seriesState = this.getSeriesStatus(gameResults, numGames);
      if (seriesState === c.GameState.IN_PROGRESS) {
        return this.completePlayNGames(numGames, gameResults);
      } else {
        return gameResults;
      }
    });//.catch(() => {});
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

  /* Void -> Promise<GameState>
    Takes two players through the setup state of a Santorini game:
    placing workers on the board. Initializes the board field on this Referee
    with the completed Board, unless a player provides an invalid PlaceRequest.
    In that case, returns a Promise that resolves to a GameResult indicating that the other player won.
   */
  setup() {
    return this.completeSetup(this.player1, []);
  }

  /* GuardedPlayer [InitWorker, ...] -> Promise<GameState>
    Completes the setup of a game of Santorini, where it's the given player's
    turn to place a Worker on the board, given the list of locations
    on the board that already contain workers.

    This method calls itself recursively until 4 workers have been placed
    or a player breaks a rule.
   */
  completeSetup(activePlayer, initWorkerList) {
    return activePlayer.placeInitialWorker(Board.copyInitWorkerList(initWorkerList)).then((placeReq) => {
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

      // Check for exit condition after worker is added to list of InitWorkers
      if (initWorkerList.length >= c.NUM_WORKERS) {
        this.board = new Board(initWorkerList);
        return c.GameState.IN_PROGRESS;
      } else {
        return this.completeSetup(this.flip(activePlayer), initWorkerList);
      }
    }).catch(() => {
      return [this.playerId(this.flip(activePlayer)), c.EndGameReason.BROKEN_RULE];
    });
  }

  /* Player -> Promise<GameState>
    Get a Promise from the given Player, containing their next Turn.
    Apply the Turn to this Referee's Board if it:
      - is well-formed
      - refers to themself and not the other player
      - and is valid according to the Rulechecker
    If the Turn was applied to the Board, return a Promise resolving to either
      - a GameResult indicating that the game should continue
      - or a GameResult where the given Player won.
    Otherwise, return a Promise that resolves to a GameResult indicating
    that the given Player broke the rules.
   */
  getAndApplyTurn(activePlayer) {
    return activePlayer.takeTurn(this.board.copy()).then((turn) => {
      if (this.checkTurn(turn, activePlayer)) {
        this.board.applyTurn(turn);

        this.notifyAllObservers(o => {
          o.turnTaken(turn, this.board)
        });
      } else {
        return [this.playerId(this.flip(activePlayer)), c.EndGameReason.BROKEN_RULE];
      }

      if (RC.hasWon(this.board, this.playerId(activePlayer)) || RC.hasLost(this.board, this.playerId(this.flip(activePlayer)))) {
        return [this.playerId(activePlayer), c.EndGameReason.WON];
      } else {
        return c.GameState.IN_PROGRESS;
      }
    }).catch(() => {
      return [this.playerId(this.flip(activePlayer)), c.EndGameReason.BROKEN_RULE];
    });
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