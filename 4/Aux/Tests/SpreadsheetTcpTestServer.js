/*
Test Plan

Parameterized over a response state:
dictionary linked to upon startup (cmd line arg points to file)

Listens on a TCP socket for an input,
if input exists in dict, sends back corresponding output

*/


const net = require('net');
const JsonParse = require('./../Source/lib/JsonParse.js');
const { StringDecoder } = require('string_decoder');

// get our data from stdin (pipe data file into program)

let interactions = [];

process.stdin.on('readable', () => {
	let chunk = process.stdin.read();
	if (chunk != null) {
		interactions = JsonParse.parseInputString(chunk)[0];
	}
});

const server = net.createServer(function(socket) {
	console.log('Client connected.');
  socket.on('data', function(chunk) {
		const decoder = new StringDecoder('utf8');
		let decodedChunk = decoder.write(chunk);
		console.log('Client sent: ' + decodedChunk);
    let response = JSON.stringify(processInput(decodedChunk));
		console.log('Replying with: ' + response);
    socket.write(response + '\n');
  });
});

server.listen(8000, '127.0.0.1');

function processInput(str) {
  let expectedInput = interactions.splice(0,1)[0]; // remove first elem from array
  let actualInput = JsonParse.parseInputString(str)[0];

  // assert throws an error if the jsons are not equal
  let inputsEqual = JSON.stringify(expectedInput) == JSON.stringify(actualInput);
	if (!inputsEqual) {
    throw "Expected " + JSON.stringify(expectedInput) + ", got " + JSON.stringify(actualInput);
	}
  let output = interactions.splice(0,1)[0];
  return output;
}
