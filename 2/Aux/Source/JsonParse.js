let buff = '';
let arr = [];

/*
Appends the input chunk to the buffer, character by character.
Checks if the buffer represents a complete JSON value at each step,
clears buffer when a complete JSON value is found, and adds that value
to the array.
*/
function processChunk(chunk) {
	while (chunk.length > 0) {
		let currentChar = chunk.substring(0, 1);
		chunk = chunk.substring(1, chunk.length);

		buff = buff.concat(currentChar);
		try {
			let currentJson = JSON.parse(buff);
			buff = '';
			arr.push(currentJson);
		} catch (error) {
			// clear buffer if it only includes whitespace (e.g. from newlines)
			if (buff.trim().length == 0) {
				buff = '';
			}
		}
	}
}

/*
Prints the parsed JSON values in the given array,
with additional formatting to number them in reverse index order.
*/
function printArray(arr) {
	for (let index = 0; index < arr.length; index++) {
		let outputObject = '[' + (arr.length - index - 1) + ',' + JSON.stringify(arr[index]) + ']\n';
		process.stdout.write(outputObject);
	}
}



process.stdin.setEncoding('utf8');

process.stdin.on('readable', () => {
	let chunk = process.stdin.read();
	if (chunk != null) {
		processChunk(chunk);
	}
});

process.stdin.on('end', () => {
	// If there is unparsed input in the buffer, this means
	// the input contained invalid JSON.
	if (buff.length > 0) {
		process.stdout.write('Invalid JSON.\n');
	} else {
		printArray(arr);
	}
});
