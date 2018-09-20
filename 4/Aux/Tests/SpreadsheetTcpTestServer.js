/*
Test Plan

Parameterized over a response state:
dictionary linked to upon startup (cmd line arg points to file)

Listens on a TCP socket for an input,
if input exists in dict, sends back corresponding output

*/


const net = require('net');
const JsonParse = require('./../Source/lib/JsonParse.js');

// get our data from stdin (pipe data file into program)

let interactions = [];

process.stdin.on('readable', () => {
	let chunk = process.stdin.read();
	if (chunk != null) {
		interactions = JsonParse.parseInputString(chunk);
	}
});

const server = net.createServer(function(socket) {
  socket.on('data', function(chunk) {
    let response = processInput(chunk);
    socket.write(JSON.stringify(response));
  });
});


function processInput(str) {
  let expectedInput = interactions.splice(0,1)[0]; // remove first elem from array
  let actualInput = JsonParse.parseInputString(str);

  // assert throws an error if the jsons are not equal
  try {
    let inputsEqual = assert.deepEqual(expectedInput, actualInput);
    let output = interactions.splice(0,1)[0];
    return output;
  } catch(error) {
    console.log("Expected " + expectedInput + ", got " + actualInput);
    exit(1);
  }
}
