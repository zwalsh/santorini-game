const Rulechecker = require('../Common/rulechecker');
const Board = require('../Common/board');
const RFC = require('../Common/request-format-checker');
const constants = require('../Common/constants');
const GameResult = require('../Common/game-result');

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
 * GameResult is defined in game-result.js
 *
 * EndGameReason is defined in game-result.js
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
  /* GuardedPlayer GuardedPlayer -> Referee
    Construct a Referee to run game(s) between the given players.
   */
  constructor(player1, player2, timeout) {
    // Board holds the state of a game between the 2 players
    this.board = null;
    // The 2 players that will play game(s) against each other
    this.player1 = player1;
    this.player2 = player2;
    // List of Observers registered on this Referee.
    // Observers are trusted components that are given
    // references to essential game data (as opposed to copies).
    this.observers = [];
  }

  /* Void -> Promise<[Maybe GameResult]>
  Manages a game of Santorini between the two given players.
  Notifies players of game start and end, and returns a Promise that resolves to a GameResult
  representing the winner of the game and the reason they won, or false if both of the Players
  fail in some phase of the game.
  Cleanup: Resets referee board to null after the game is over.
 */
  playGame() {
    let p1Id = this.player1.getId();
    let p2Id = this.player2.getId();
    
    let p1Notified = this.player1.newGame(p1Id, p2Id).then(() => {
      return IN_PROGRESS;
    }).catch(() => {
      return new GameResult(p2Id, p1Id, BROKEN_RULE);
    });

    let p2Notified = p1Notified.then((gameState) =>  {
      if (gameState !== IN_PROGRESS) {
        return gameState;
      } else {
        return this.player2.newGame(p2Id, p1Id).then(() => {
          return IN_PROGRESS;
        }).catch(() => {
          return new GameResult(p1Id, p2Id, BROKEN_RULE);
        });
      }
    });

    let gameSetUp = p2Notified.then((gameState) => {
      if (gameState !== IN_PROGRESS) {
        return gameState;
      }
      this.notifyAllObservers(o => { o.startGame(p1Id, p2Id) });
      return this.setup();
    });

    let gamePlayed = gameSetUp.then((gameState) => {
      if (gameState !== IN_PROGRESS) {
        return gameState;
      } else {
        return this.completePlayGame(this.player1);
      }
    });

    let playersNotifiedOfEnd = gamePlayed.then((gameResult) => {
      // notify loser
      let winner = gameResult.winner === this.player1.getId() ? this.player1 : this.player2;
      let winnerNotified = winner.notifyGameOver(gameResult).then(() => {
        if (gameResult.reason !== BROKEN_RULE) {
          let loser = this.flip(winner);
          return loser.notifyGameOver(gameResult).then(() => {
            return gameResult;
          }).catch(() => {
            return new GameResult(gameResult.winner, gameResult.loser, BROKEN_RULE);
          });
        }
        return gameResult;
      }).catch(() => {
        if (gameResult.reason !== BROKEN_RULE) {
          let loser = this.flip(winner);
          gameResult = new GameResult(gameResult.loser, gameResult.winner, BROKEN_RULE);
          return loser.notifyGameOver(gameResult).then(() => {
            return gameResult;
          }).catch(() => {
            return false;
          });
        } else {
          return false;
        }
      });

      let observersNotified = winnerNotified.then((gameResult) => {
        this.notifyAllObservers(o => { o.gameOver(gameResult) });
        this.board = null;
        return gameResult;
      });

      return observersNotified;
    });

    return playersNotifiedOfEnd;
  }

  /* GP GP -> Promise<GameState>
    Notifies both of the given players that a game is starting.
    If one of the Players breaks upon notification, then the GameState
    will be a GameResult indicating that the other player won.
  */
  notifyPlayersOfStart(player1, player2) {
    // todo
  }

  /* Promise<GameState> -> Promise<GameState>
    Given a state where both players have been notified of a new game
    (or the game is already over), sets up the game and returns an
    in progress state. If the game is already over, or if a player breaks
    a rule during setup, it will return a GameResult indicating that.
  */
  setUpGame(gameState) {
    // todo
  }





  /* Player -> Promise<GameResult>
    Given the current active player, play the game to completion.
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

  /* PositiveInteger -> Promise<[GameResult, ...]>
    Manages a given number of games of Santorini between the two given players.
    Returns a list of GameResults representing the winner of the game, and the reason they won.
    If a player breaks the rules in a game, that game is terminated and no further games are played.
    The number of games in the series must be odd, or the behavior of this method is undefined.
   */
  playNGames(numGames) {
    this.notifyAllObservers(o => { o.startSeries(this.player1.getId(), this.player2.getId(), numGames) });

    return this.completePlayNGames(numGames, []).then((gameResults) => {
      this.notifyAllObservers(o => { o.seriesOver(gameResults) });
      return gameResults;
    });
  }

  /* PositiveInteger [GameResult, ...] -> Promise<[GameResult, ...]>
    Complete a series of numGames games between the players, given
    the set of game results from any prior games in the series.
   */
  completePlayNGames(numGames, gameResults) {
    return this.playGame().then((result) => {
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
          player: activePlayer.getId(),
          x: placeReq[1],
          y: placeReq[2]
        };
        initWorkerList.push(initWorker);

        this.notifyAllObservers(o => { o.workerPlaced(placeReq, activePlayer.getId(), new Board(initWorkerList)) });
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