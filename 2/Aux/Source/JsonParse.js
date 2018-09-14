let buff = '';
let numBuff = '';
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

		// if we are already building a number, add the next digit
		// or parse the finished number if next char is not digit
		if (numBuff != '') {
			if (isDigit(currentChar)) {
				numBuff = numBuff.concat(currentChar);
			} else {
				buff = buff.concat(currentChar);
				tryParseNumBuff();
				tryParseBuff();
			}
			continue;
		}

		else if (buff == '') {
			if (isNumeric(currentChar)) {
				numBuff = numBuff.concat(currentChar);
				continue;
			} else {
				buff = buff.concat(currentChar);
				tryParseBuff();
			}
		}

		else {
			buff = buff.concat(currentChar);
			tryParseBuff();
		}
	}
}

// Is the character part of a number? (potentially a negative number)
function isNumeric(char) {
	return isDigit(char) || char == '-';
}

// Is the character a digit?
function isDigit(char) {
	return char.match(/\d/);
}

// Attempts to parse the normal buffer
function tryParseBuff() {
	if (tryParse(buff) === true) {
		buff = '';
	}
}

// Attempts to parse the number buffer
function tryParseNumBuff() {
	if (tryParse(numBuff) === true) {
		numBuff = '';
	}
}

// Attempt to process the given string as JSON,
// if successful, add to array and return true
function tryParse(string) {
	try {
		let currentJson = JSON.parse(string);
		arr.push(currentJson);
		return true;
	} catch (error) {
		// clear buffer if it only includes whitespace (e.g. from newlines)
		if (buff.trim().length == 0) {
			buff = '';
		}
		return false;
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
		return;
	} else {
		printArray(arr);
	}
});
