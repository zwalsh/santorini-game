const readline = require('readline');
const Parse = require('../../../2/Auxilary/src/parse');

const validInput = input => {
  return !Array.isArray(input) ||
    typeof input[1] !== 'string';
};

// takes in 3 functions to communicate with the server
// build: create a spreadsheet
// set: set a Cell's value to a given JF
// at: get a Cell's value, given a reference
const main = (build, set, at) => {
  // initialize the readline interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  // event triggers when a new line is given (i.e. end of input)
  rl.on('line', input => {
    // ...
    let store = [];
    let buffer = '';
    const possibleJSON = Parse.parse(input, store, buffer);

    // check if the JSON object is an array - the only valid form of JSON object for the commands
    // if passes, it is a valid Array
    if (!validInput) return;

    const command = possibleJSON[0];

    // handle the "named spreadsheet" creation
    if (command === 'sheet') {
      build(possibleJSON[2]);
    }
    // handle the "set request"
    if (command === 'set') {
      set({ 
        'x': possibleJSON[2],
        'y': possibleJSON[3],
      }, possibleJSON[4]);
    }
    // handle the "at request"
    if (command === 'at') {
      const answer = at(possibleJSON[2], possibleJSON[3]);
      process.stdout(answer);
    }
    return;
  });

  // event that triggers when the input stream is closed (^D)
  rl.on('close', () => {
    console.log('Connection closed');
  });
};

// starting the script
main(store);

module.exports = {
  main,
};
