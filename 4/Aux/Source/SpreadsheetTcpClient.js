const net = require('net');
const JsonParse = require('./lib/JsonParse.js');
const { StringDecoder } = require('string_decoder');

// create a socket and connect to the Spreadsheet server
const socket = new net.Socket();
//console.log("Attempting to connect at: " + process.argv[2]);
socket.connect(8000, process.argv[2]);
// this is our sign-up name
socket.write(JSON.stringify('sbzw'));
// holds commands given over STDIN until an "at" is received
let batch = [];

// takes in a valid command and adds it to the batch. Sends the batch if
// the given command is an "at" command.
function addToBatch(command) {
  batch.push(command);
  if (command[0] == 'at') {
    // send the batch to the server!
    let message = JSON.stringify(batch);
    //console.log("Sending message: " + message);
    socket.write(message);
    batch = [];
  }
}

// checks that the given JSON is well-formed. This means that the JSON is an
// array, where the first element is a known command, length is correct based
// on that command, and the types of the things at each index.
function isWellFormed(json) {
  if (json.length < 3) {
    return false;
  }
  switch (json[0]) {
    // ["at", sheet name, index, index]
    case 'at':
      return json.length == 4 &&
              typeof json[1] == 'string' &&
              Number.isInteger(json[2]) &&
              Number.isInteger(json[3]);
    // ["sheet", name, [[JF, ...] ...]]
    case 'sheet':
      return json.length == 3 &&
              typeof json[1] == 'string' &&
              Array.isArray(json[2]) &&
              isValidSheet(json[2]);
    // ["set", name, index, index, JF]
    case 'set':
      return json.length == 5 &&
              typeof json[1] == 'string' &&
              Number.isInteger(json[2]) &&
              Number.isInteger(json[3]) &&
              Formula.isValidFormula(json[4]);
    default:
      return false;
  }
}

function isValidSheet(arr) {
  //console.log("Checking is valid sheet: " + JSON.stringify(arr));
  for (let idx in arr) {
    let row = arr[idx];
    if (!Array.isArray(row)) {
    //  console.log('sheet is invalid');
      return false;
    }
    for (let rIdx in row) {
      let jf = row[rIdx];
      //console.log("checking jf: " + JSON.stringify(jf));
      if (!Formula.isValidFormula(jf)) {
        //console.log('sheet is invalid');
        return false;
      }
    }
  }
  return true;
}

function processInput(chunk) {
  // this gives us valid JSON that has been parsed
  let completedJson = JsonParse.parseInputString(chunk);

  for (let index in completedJson) {
    let json = completedJson[index];
    // check well-formedness
    if (isWellFormed(json)) {
      addToBatch(json);
    }
  }
}

process.stdin.on('readable', ()=>{
  let chunk = process.stdin.read();
  if (chunk != null) {
    processInput(chunk);
  }
});

process.stdin.on('end', ()=>{
  socket.end();
});

socket.on('data', (chunk)=>{
	const decoder = new StringDecoder('utf8');
	let decodedChunk = decoder.write(chunk);
  let receivedJson = JsonParse.parseInputString(decodedChunk);
  // our client only writes the "at" responses back to the user
  for (let index in receivedJson) {
    let value = receivedJson[index];
    if (typeof value == 'number' || typeof value == 'boolean') {
      console.log(value);
    }
  }
});

class Formula {

  constructor(formula) {
    if (Formula.isValidNumber(formula)) {
      this.contents = formula;
      this.type = 'number';
    } else if (Formula.isValidReference(formula)) {
      this.contents = formula;
      this.type = 'reference';
    } else if (Formula.isValidOperation(formula)) {
      this.contents = formula;
      this.type = 'operation';
    } else {
      throw `Invalid Formula contents: ${formula}`;
    }
  }

  getType() {
    return this.type;
  }

  getContents() {
    return this.contents;
  }

  static isValidFormula(contents) {
  return Formula.isValidNumber(contents) ||
  Formula.isValidReference(contents) ||
  Formula.isValidOperation(contents);
  }


  /* Is n a valid number? */
  static isValidNumber(n) {
    return typeof n == 'number';
  }

  /* Is ref a valid Reference? */
  static isValidReference(ref) {
    return Array.isArray(ref)
        && ref.length == 3
        && ref[0] == '>'
        && typeof ref[1] == 'number'
        && typeof ref[2] == 'number';
  }

  /* Is op a valid Operation? */
  static isValidOperation(op) {
    return Array.isArray(op) && op.length == 3
        && Formula.isValidFormula(op[0]) && Formula.isValidFormula(op[2])
        && (op[1] == '+' || op[1] == '*');
  }
};
