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
const JsonToComponent = require('./../../Santorini/Lib/JsonToComponent.js');

process.stdin.on('readable', () => {
  let chunk = process.stdin.read();
  if (chunk != null) {
    let requests = JsonParser.parseInputString(chunk);
    handleRequests(requests);
  }
});

/*
Accept a list of incoming requests.

*/
function handleRequests(requests) {
  /*
  Actually process the  board req. here.
  then give the appropriate info to each function.
   */
  switch(requests.length) {
    case 3:
      handleBoardOnly();
      break;
    case 4:
      handleWinningMove();
      break;
    case 5:
      handleBoardAndTurn();
      break;
    default:
      throw 'uh oh spaghettio';
  }
}

/*
Convert board req. to GameState,
ensure that it's proper player's turn,
and call chooseTurn() with gamestate.
 */
function handleBoardOnly() {

}

/*
convert board req. to GameState,
ensure it's proper player's turn,
and call chooseTurn() with depth 0
to ensure that the gamestate does have the winning move
we are looking for
-- or --
print "yes"
 */
function handleWinningMove() {

}

/*
Convert board req. to GameState,
ensure it's proper player's turn,
apply given Turn actions,
and call canWin() with gamestate.
 */
function handleBoardAndTurn() {

}
