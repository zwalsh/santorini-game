const net = require('net');
const JsonParse = require('./lib/JsonParse.js');
const { StringDecoder } = require('string_decoder');

// create a socket and connect to the Spreadsheet server
const socket = new net.Socket();
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
              Array.isArray(json[2]);
    // ["set", name, index, index, JF]
    case 'set':
      return json.length == 5 &&
              typeof json[1] == 'string' &&
              Number.isInteger(json[2]) &&
              Number.isInteger(json[3]);
    default:
      return false;
  }
}

function processInput(chunk) {
  // this gives us valid JSON that has been parsed
  try {
    let completedJson = JsonParse.parseInputString(chunk);
  } catch (err) {
    throw `Given non-JSON input: ${chunk}`;
  }

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
