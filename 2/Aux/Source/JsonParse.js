process.stdin.setEncoding('utf8');

let buff = '';
let arr = [];

process.stdin.on('readable', () => {
	let chunk = process.stdin.read();
	if (chunk != null) {
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
});

function printArray(arr) {
	for (let index = 0; index < arr.length; index++) {
		let outputObject = '[' + (arr.length - index - 1) + ',' + JSON.stringify(arr[index]) + ']\n';
		process.stdout.write(outputObject);
	}	
}

process.stdin.on('end', () => {
	if (buff.length > 0) {
		process.stdout.write('Invalid JSON.');
	} else {
		printArray(arr);
	}
});


