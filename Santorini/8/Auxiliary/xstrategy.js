const utility = require("../../Common/json-to-component");
const Strategy = require("../../Common/strategy");

const process = require('process');
let out = process.stdout;
process.stdin.setEncoding('utf8');

// On inputs, parse the string to JSON and add them to the list of commands.
process.stdin.on('readable', () => {
  const chunk = process.stdin.read();
  if (chunk !== null) {

    utility.jsonParser(chunk).forEach((c) => {
      parseCommand(c);
    });
  }
});

// Once all commands have been received, see if the turn action was legal.
process.stdin.on('end', () => {
  strat = new Strategy(playerID, opponentID, lookAhead, 0);

  if (potentialMove.length === 0) {
    strat.aliveAfterLookahead(board.copy(), lookAhead, playerID) ?
      out.write(JSON.stringify("yes") + "\n") :
      out.write(JSON.stringify("no") + "\n");
  } else {
    strat.decisionKeepsAlive(board.copy(), lookAhead, playerID, potentialMove) ?
      out.write(JSON.stringify("yes") + "\n") :
      out.write(JSON.stringify("no") + "\n");
  }

});

let board;
let playerID;
let opponentID;
let lookAhead;
let strat;
let potentialMove = [];

// Dispatches inputted JSON commands to the appropriate adapter method.
// JSON -> Boolean
function parseCommand(json) {
  if (typeof json === 'string') {
    playerID = json;
  } else if (typeof json === 'number') {
    lookAhead = json;
  } else if (typeof json[0] !== 'string') {
    board = utility.parseBoard(json);
    opponentID = parseOpponent(json);
  } else {
    let command = json[0];

    // TODO: Do we just want to push the move to the strategy as-is? or parse it out a little bit?
    // Send data to the corresponding adapter function based on the given command.
    switch (command) {
      case 'move':
        // NOTE: This is a Worker ID
        potentialMove.push(["move", parseInt(json[1].substring(json[1].length - 1)), json[2]]);
        break;
      case '+build':
        potentialMove.push(["build", json[1]])
        break
      default:
        console.log(json);
        throw "Error: Invalid command";
    }
  }
}

function parseOpponent(boardSpec) {
  let opp;
  boardSpec.some((e) => {
    return e.some((t) => {

      if (typeof t === 'string') {
        let id = t.substring(1, t.length - 1);
        if (id !== playerID) {
          opp = id;
          return true;
        }
      }
    });
  });

  return opp;
}