const net = require('net');
const JsonParse = require('./lib/JsonParse.js')
let input = '';

process.stdin.setEncoding('utf8');

const sock = new net.Socket({"allowHalfOpen":true});
sock.connect(8000,'127.0.0.1');

// define what to do when socket receives data
sock.on('data', function(data){
	//console.log("client got some data back: ");
	process.stdout.write(data);
});

// read command line input
process.stdin.on('readable', () => {
	let chunk = process.stdin.read();
	if (chunk != null) {
		sock.write(chunk);
	}
});

// what happens when command line closes
process.stdin.on('end', () => {
	sock.end();
	//console.log("input stream ending");
});
