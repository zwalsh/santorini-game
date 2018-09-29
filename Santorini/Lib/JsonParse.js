const nearley = require("nearley");
const jsonGrammar = require("./NewJsonGrammar.js"); // TODO change this back??
// const jsonParser = new nearley.Parser(nearley.Grammar.fromCompiled(jsonGrammar));

function makeJsonParser() {
	return new nearley.Parser(nearley.Grammar.fromCompiled(jsonGrammar));
}

function jsonArrayToString(arr) {
	let outputString = '';
	for (let index = 0; index < arr.length; index++) {
		let outputObject = '[' + (arr.length - index - 1) + ',' + JSON.stringify(arr[index]) + ']\n';
		outputString += outputObject;
	}
	return outputString;
}

exports.parseAndFormatInputString = function(inputString) {
	const jsonParser = makeJsonParser();
	jsonParser.feed(inputString);
	if (jsonParser.results.length > 0) {
		return(jsonArrayToString(jsonParser.results[0].reverse()));
	} else {
		throw `Invalid JSON sent: ${inputString}`;
	}
}

exports.parseInputString = function(inputString) {
	const jsonParser = makeJsonParser();
	console.log("parsing input string...");
	jsonParser.feed(inputString);
	console.log("done parsing input string: " + JSON.stringify(jsonParser.results[0].reverse()));
	if (jsonParser.results.length > 0) {
		return(jsonParser.results[0].reverse());
	} else {
		throw `Invalid JSON sent: ${inputString}`;
	}
}
