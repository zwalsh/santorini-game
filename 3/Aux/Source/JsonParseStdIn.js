const JsonParse = require('./lib/JsonParse.js')
let input = '';

process.stdin.setEncoding('utf8');

process.stdin.on('readable', () => {
	let chunk = process.stdin.read();
	if (chunk != null) {
		input += chunk;
	}
});

process.stdin.on('end', () => {
	process.stdout.write(JsonParse.parseInputString(input));
});
