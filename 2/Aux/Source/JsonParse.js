let buff = '';
let numBuff = '';
let arr = [];

/*
Appends the input chunk to the buffer, character by character.
Checks if the buffer represents a complete JSON value at each step,
clears buffer when a complete JSON value is found, and adds that value
to the array.
*/
// Ambiguity: can a plain number be split across multiple lines?
// we have decided: no, because we want to be able to enter multiple
// numbers sequentially, which can only be denoted with whitespace or
// a new line.
function processChunk(chunk) {
	while (chunk.length > 0) {
		let currentChar = chunk.substring(0, 1);
		// console.log("\ncurrent char:__" + currentChar + "__");
		// console.log("isNum? " + isNum(currentChar));
		// console.log("buff: " + buff);
		// console.log("numBuff: " + numBuff);

		chunk = chunk.substring(1, chunk.length);

		// if we are already building a number, add the next digit
		// or parse the finished number if next char is not digit
		if (numBuff != '') {
			if (isNum(currentChar)) {
				numBuff = numBuff.concat(currentChar);
			} else {
				buff = buff.concat(currentChar);
				// console.log("inner numBuff " + numBuff);
				tryParseNumBuff();
				tryParseBuff();
			}
			continue;
		}

		else if (buff == '') {
			if (isNum(currentChar)) {
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

// Is the character a digit?
function isNum(char) {
	return char == "0" ||
	       char == "1" ||
				 char == "2" ||
				 char == "3" ||
				 char == "4" ||
				 char == "5" ||
				 char == "6" ||
				 char == "7" ||
				 char == "8" ||
				 char == "9";
}

function tryParseBuff() {
	if (tryParse(buff) === true) {
		buff = '';
	}
}

function tryParseNumBuff() {
	if (tryParse(numBuff) === true) {
		numBuff = '';
	}
}

// attempt to process the given string as JSON,
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
	}
}


/*
Prints the parsed JSON values in the given array,
with additional formatting to number them in reverse index order.
*/
function printArray(arr) {
	// console.log("help " + arr.length);
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
		// console.log("buff length: " + buff.length + ", buff: __" + buff + "__");
		process.stdout.write('Invalid JSON.\n');
	} else {
		printArray(arr);
	}
});
