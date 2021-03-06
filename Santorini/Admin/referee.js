const Rulechecker = require('../Common/rulechecker');
const Board = require('../Common/board');
const RFC = require('../Common/request-format-checker');
const constants = require('../Common/constants');
const GameResult = require('../Common/game-result');
const protectedPromise = require('../Lib/promise-protector');

const BROKEN_RULE = constants.EndGameReason.BROKEN_RULE;
const WON = constants.EndGameReason.WON;
const IN_PROGRESS = constants.GameState.IN_PROGRESS;

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

 All methods on the Referee that call methods on a player (GuardedPlayer)
 return Promises to account for the asynchronous nature of interacting with Player components.

 Clients may register observers on the Referee, and the Referee will notify
 all its Observers of any significant events in the games or series of games it runs.

 * ======================== DATA DEFINITIONS ======================
 *
 * GuardedPlayer (GP) is defined in guarded-player.js
 *
 * WorkerRequest, PlaceRequest, MoveRequest, BuildRequest, and Turn
 *  are defined in Common/player-interface.js
 *
 * GameResult is defined in game-result.js
 *
 * EndGameReason is defined in game-result.js
 *
 * A GameState is one of:
 * - "IN_PROGRESS"
 * - GameResult
 * and represents a game being in-progress or over.
 *
 * Match is defined in match-table.js
 *
 */

const RC = new Rulechecker();

class Referee {
  /* GuardedPlayer GuardedPlayer -> Referee
    Construct a Referee to run game(s) between the given players.
   */
  constructor(player1, player2, observerTimeout) {
    // Board holds the state of a game between the 2 players
    this.board = null;
    // The 2 players that will play game(s) against each other
    this.player1 = player1;
    this.player2 = player2;
    // List of Observers registered on this Referee.
    // Observers are trusted components that are given
    // references to essential game data (as opposed to copies).
    this.observers = [];
    this.observerTimeout = observerTimeout;
  }

  /* Void -> Promise<[Maybe GameResult]>
  Manages a game of Santorini between the two given players.
  Notifies players of game start and end, and returns a Promise that resolves to a GameResult
  representing the winner of the game and the reason they won, or false if both of the Players
  fail in some phase of the game.
  Cleanup: Resets referee board to null after the game is over.
 */
  playGame() {
    return this.notifyPlayersOfStart()
      .then(gs => this.setup(gs))
      .then(gs => this.playUntilOver(gs))
      .then(gr => this.notifyPlayersOfEndGame(gr));
  }

  // ========== Notify of Game Start ==========

  /* Void -> Promise<GameState>
    Notifies both of the players that a game is starting.
    If one of the Players breaks upon notification, then the GameState
    will be a GameResult indicating that the other player won.
  */
  notifyPlayersOfStart() {
    let p1Notified = this.notifyPlayerOfStart(this.player1);
    return p1Notified.then((gameState) =>  {
      if (gameState !== IN_PROGRESS) {
        return gameState;
      } else {
        return this.notifyPlayerOfStart(this.player2);
      }
    });
  }

  /* GP -> Promise<GameState>
    Notifies the given player of the start of a game against the given
    opponent. Returns a GameState indicating whether the game should
    continue, or if the player failed to handle the notification.
   */
  notifyPlayerOfStart(player) {
    let opponentId = this.flip(player).getId();
    return player.newGame(opponentId).then(() => {
      return IN_PROGRESS;
    }).catch(() => {
      let playerId = player.getId();
      return new GameResult(opponentId, playerId, BROKEN_RULE);
    });
  }

  // ========== Setup (Worker Placement) ==========

  /* GameState -> Promise<GameState>
    Given a state where both players have been notified of a new game
    (or the game is already over), sets up the game and returns an
    in progress state. If the game is already over, or if a player breaks
    a rule during setup, it will return a GameResult indicating that.
  */
  setup(gameState) {
    if (gameState !== IN_PROGRESS) {
      return Promise.resolve(gameState);
    }
    let p1Id = this.player1.getId();
    let p2Id = this.player2.getId();
    this.notifyAllObservers(o => { return o.startGame(p1Id, p2Id) });
    return this.completeSetup(this.player1, []);
  }

  /* GuardedPlayer [InitWorker, ...] -> Promise<GameState>
    Completes the setup of a game of Santorini, where it's the given player's
    turn to place a Worker on the board, given the list of locations
    on the board that already contain workers.

    This method calls itself recursively until 4 workers have been placed
    or a player breaks a rule. When all workers are placed, initializes this Referee's board.
   */
  completeSetup(activePlayer, initWorkerList) {
    return activePlayer.placeInitialWorker(Board.copyInitWorkerList(initWorkerList)).then((placeReq) => {
      if (this.checkPlaceReq(placeReq, initWorkerList)) {
        let initWorker = {
          player: activePlayer.getId(),
          x: placeReq[1],
          y: placeReq[2]
        };
        initWorkerList.push(initWorker);
        let initWorkerListCopy = initWorkerList.slice();

        this.notifyAllObservers(o => { return o.workerPlaced(placeReq.slice(), activePlayer.getId(), new Board(initWorkerListCopy.slice())) });
      } else {
        return new GameResult(this.flip(activePlayer).getId(), activePlayer.getId(), BROKEN_RULE);
      }

      // Check for exit condition after worker is added to list of InitWorkers
      if (initWorkerList.length >= constants.NUM_WORKERS) {
        this.board = new Board(initWorkerList);
        return IN_PROGRESS;
      } else {
        return this.completeSetup(this.flip(activePlayer), initWorkerList);
      }
    }).catch(() => {
      return new GameResult(this.flip(activePlayer).getId(), activePlayer.getId(), BROKEN_RULE);
    });
  }

  // ========== Play Game ==========

  /* GameState -> Promise<GameResult>
    Given a state where the game has been set up (both players have placed
    all their workers), this function carries the players through
    the game until one wins or breaks a rule. It returns a Promise of the
    final result of the game.
  */
  playUntilOver(gameStateAfterSetUp) {
    if (gameStateAfterSetUp !== IN_PROGRESS) {
      return Promise.resolve(gameStateAfterSetUp);
    } else {
      return this.completePlayGame(this.player1);
    }
  }

  /* Player -> Promise<GameResult>
    Given the current active player, play the game to completion.
    Take a turn for the given player, then call this method again
    with the opposing player if the game is not over.
   */
  completePlayGame(activePlayer) {
    return this.getAndApplyTurn(activePlayer).then((gameState) => {
      if (gameState === IN_PROGRESS) {
        return this.completePlayGame(this.flip(activePlayer));
      } else {
        return gameState;
      }
    });
  }

  /* Player -> Promise<GameState>
    Get a Promise from the given Player, containing their next Turn.
    If the turn is their name, return a GameResult where the other player won legitimately.
    Else, apply the Turn to this Referee's Board if it:
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
      if (turn === activePlayer.getId()) {
        return new GameResult(this.flip(activePlayer).getId(), activePlayer.getId(), WON);
      } else if (this.checkTurn(turn, activePlayer)) {
        this.board.applyTurn(turn);
        let curBoardCopy = this.board.copy();

        this.notifyAllObservers(o => {
          let turnCopy = JSON.parse(JSON.stringify(turn));
          return o.turnTaken(turnCopy, curBoardCopy);
        });
      } else {
        return new GameResult(this.flip(activePlayer).getId(), activePlayer.getId(), BROKEN_RULE);
      }

      if (RC.hasWon(this.board, activePlayer.getId()) || RC.hasLost(this.board, this.flip(activePlayer).getId())) {
        return new GameResult(activePlayer.getId(), this.flip(activePlayer).getId(), WON);
      } else {
        return IN_PROGRESS;
      }
    }).catch(() => {
      return new GameResult(this.flip(activePlayer).getId(), activePlayer.getId(), BROKEN_RULE);
    });
  }

  // ========== Notify of Game End ==========

  /* GameResult -> Promise<[Maybe GameResult]>
    Given the result of a fully-played game, notifies any players that
    have not yet broken of the result of the game. If both players break
    before this is possible, then no GameResult is returned.
  */
  notifyPlayersOfEndGame(finishedGameResult) {
    let winner = finishedGameResult.winner === this.player1.getId() ? this.player1 : this.player2;
    let loser = this.flip(winner);

    let winnerNotified = winner.notifyGameOver(finishedGameResult).then(() => {
      return this.notifyLoserPostSuccess(winner, loser, finishedGameResult);
    }).catch(() => {
      return this.notifyLoserPostFailure(loser, finishedGameResult);
    });

    return winnerNotified.then((gameResult) => {
      this.notifyAllObservers(o => { return o.gameOver(gameResult.copy()) });
      this.board = null;
      return gameResult;
    });
  }

  /* GP GP GameResult -> Promise<GameResult>
    Notify loser of game result after successfully notifying winner
  */
  notifyLoserPostSuccess(winner, loser, gameResult) {
    if (gameResult.reason === BROKEN_RULE) {
      // Don't notify loser if they already broke.
      return Promise.resolve(gameResult);
    } else {
      return loser.notifyGameOver(gameResult).then(() => {
        return gameResult;
      }).catch(() => {
        // Loser broke, so the end game reason must change to broken rule
        return new GameResult(gameResult.winner, gameResult.loser, BROKEN_RULE);
      });
    }
  }

  /* GP GameResult -> Promise<[Maybe GameResult]>
    Notify loser of game result after failing to notify winner
  */
  notifyLoserPostFailure(loser, gameResult) {
    if (gameResult.reason === BROKEN_RULE) {
      // Don't notify loser either if they already broke
      return Promise.resolve(false);
    } else {
      gameResult = new GameResult(gameResult.loser, gameResult.winner, BROKEN_RULE);
      return loser.notifyGameOver(gameResult).then(() => {
        return gameResult;
      }).catch(() => {
        return false;
      });
    }
  }

  // ========== Play Series ==========

  /* PositiveInteger -> Promise<Match>
    Manages a given number of games of Santorini between the two given players.
    When a player (or players) break a rule, the series is terminated.
    The number of games in the series must be odd, or the behavior of this method is undefined.
   */
  playNGames(numGames) {
    this.notifyAllObservers(o => { return o.startSeries(this.player1.getId(), this.player2.getId(), numGames); });

    return this.completePlayNGames(numGames, []).then((match) => {
      this.notifyAllObservers(o => { return o.seriesOver(match.map(gr => gr.copy())); });
      return match;
    });
  }

  /* PositiveInteger [GameResult, ...] -> Promise<Match>
    Complete a series of numGames games between the players, given
    the set of game results from any prior games in the series.
   */
  completePlayNGames(numGames, gameResults) {
    return this.playGame().then((result) => {
      if (result === false) {
        return [];
      }
      gameResults.push(result);
      if (result.reason === BROKEN_RULE) {
        return gameResults;
      }
      if (this.isSeriesOver(gameResults, numGames)) {
        return gameResults;
      } else {
        return this.completePlayNGames(numGames, gameResults);
      }
    });
  }

  /* [GameResult, ...] Natural -> Boolean
    Given the length of a series, determine if more than half of the
    games in the series have been won by one player.
  */
  isSeriesOver(gameResults, numGames) {
    let p1WinCount = gameResults
      .filter(gameResult => (gameResult.winner === this.player1.getId()))
      .length;
    let p2WinCount = gameResults.length - p1WinCount;
    return p1WinCount > numGames / 2 || p2WinCount > numGames / 2;
  }

  //  ========== General Helpers ==========

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
      turn[0][1].player === activePlayer.getId() &&
      RC.isValidTurn(this.board, turn);
  }

  /* Player -> Player
    Switches the active player.
   */
  flip(activePlayer) {
    return activePlayer === this.player1 ? this.player2 : this.player1;
  }

  // ========== Observers ==========

  /* [Observer -> Promise<Void>] -> [Promise<Void>]
    Notifies all observers in the list using the given notifier function.
    If an observer fails to be notified within this Referee's timeout,
    removes it from the list of observers.

    Returns a list of the resulting Promises from each notification
    for testing purposes only.
  */
  notifyAllObservers(notifier) {
    return this.observers.map((o) => {
      return this.promiseNotifyObserver(o, notifier).catch(() => {
        this.removeObserver(o);
        return;
      });
    });
  }

  /* Observer [Observer -> Promise<Void>] -> Promise<Void>
    Return a protected call to notify the observer using the given notifier function.
  */
  promiseNotifyObserver(o, notifier) {
    return protectedPromise(o, notifier, this.observerTimeout);
  }

  /* Observer -> Void
    Add the given observer to the set of Observers that this Referee notifies of events.
  */
  addObserver(observer) {
    this.observers.push(observer);
  }

  /* Observer -> Void
    Remove the given Observer from the observer list.
  */
  removeObserver(observer) {
    let index = this.observers.indexOf(observer);
    if (index >= 0) {
      let beforeRemoved = this.observers.slice(0, index);
      let afterRemoved = this.observers.slice(index + 1);
      this.observers = beforeRemoved.concat(afterRemoved);
    }
  }
}

module.exports = Referee;