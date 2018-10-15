/*
  This module implements a test harness that enables integration testing
  of the StayAliveStrategy component.


  Reads in a test scenario as a sequence of JSON arrays.
  Creates a GameState from the given board data, a Turn from the given
  action data (if provided), and uses the Strategy to determine whether
  or not the given player can stay alive in the given number of rounds.

  See the RuleCheckerHarness in 7/Aux/ for a full data definition of
  Board, Move, and MoveBuild JSON data.

  A set of test data will take the following form:
    - a JSON string, the name of a player,
    - a Board specification that is not final,
    - a JSON (natural) number, denoting the number of look-ahead rounds,
    - an optional Move, and
    - a MoveBuild if the Move is not a winning one.

*/

const JsonParser = require('./../../Santorini/Lib/JsonParse.js');
const StayAliveStrategy = require('./../../Santorini/Player/StayAliveStrategy.js');
const Action = require('./../../Santorini/Common/Action.js');
const GameState = require('./../../Santorini/Common/GameState.js');
const JsonToComponent = require('./../../Santorini/Lib/JsonToComponent.js');

process.stdin.on('readable', () => {
  let chunk = process.stdin.read();
    if (chunk != null) {
        let reqs = JsonParser.parseInputString(chunk);
        handleRequests(reqs);
  }
});

/*
Accept a set of test data (as specified in file header)
and test the Strategy using the input scenario.
*/
function handleRequests(reqs) {
  // Process board request here, then give appropriate info to each function.
  let targetPlayerName = reqs[0];

  let gameStateData = JsonToComponent.createGameState(reqs[1]);
  let numRounds = Number.parseInt(reqs[2]);

  let gameState = gameStateData[0];
  // Map of Workers (ex. "one1", "p2") to their WorkerId in the game
  let workerNameToId = gameStateData[1];

  // Array of player names (ex. "one", "p") where index is their PlayerId in the game
  let playerNameToId = gameStateData[2];
  let targetPlayerId = playerNameToId.indexOf(targetPlayerName);

  // After creating the game state and placing workers on it,
  // ensure that its current turn is set to the player we are playing for.
  if (gameState.getWhoseTurn() !== targetPlayerId) {
    gameState.flipTurn();
  }

  switch(reqs.length) {
    case 3:
      handleBoardOnly(gameState, targetPlayerId, numRounds);
      break;
    case 4:
      handleWinningMove();
      break;
    case 5:
      handleBoardAndTurn(gameState, workerNameToId, playerNameToId,
        numRounds, reqs.slice(3));
      break;
    default:
      throw 'Invalid test case given';
  }
}

/*
Given a GameState where it is the designated player's turn
(according to the request being handled), print "yes" or "no"
if they can or cannot make any moves that will keep them alive
for the given number of rounds.
 */
function handleBoardOnly(gameState, targetPlayerId, numRounds) {
  let turn = StayAliveStrategy.chooseTurn(gameState, numRounds);
  turn === false ? printNo() : printYes();
}

/*
Given a request with a winning move, we do not need to check with
our Strategy to know that the player will not lose from the given GameState.
They have already won in this round/turn.
 */
function handleWinningMove() {
  printYes();
}

/* GameState  Map<Worker,WorkerId>  [String, ...]  Natural [Move, MoveBuild] -> Void
  Given a GameState where it is the designated player's turn
  (according to the request being handled), and data representing a Turn
  for that player to take, apply that Turn to the GameState, and
  print 1. "yes" or 2. "no" if the resulting GameState is one where
  the player's opponent 1. is not or 2. is guaranteed to win.

  As the given turn counts as one look-ahead round, this function will check
  if the opponent can win in one less than the given number of rounds,
  after application of the turn.

  If the # of rounds to look ahead to is 0, then we know that the player
  can certainly survive in this round, because they have supplied a valid
  move for this round and therefore have not already lost.
 */
function handleBoardAndTurn(gameState, workerNameToId, playerNameToId, numRounds, turn) {
  if (numRounds === 0) {
    printYes();
    return;
  }
  let moveAction = JsonToComponent.createMoveAction(turn[0], workerNameToId, gameState);
  Action.execute(moveAction, gameState);
  let workerId = moveAction.getWorkerId();
  let buildAction = JsonToComponent.createBuildAction(turn[1], workerId, gameState);
  Action.execute(buildAction, gameState);

  StayAliveStrategy.canWin(gameState, numRounds - 1) ? printNo() : printYes();
}

/*
Write the JSON string "no" to stdout.
 */
function printNo() {
  process.stdout.write(JSON.stringify("no"));
}

/*
Write the JSON string "yes" to stdout.
 */
function printYes() {
  process.stdout.write(JSON.stringify("yes"));
}
