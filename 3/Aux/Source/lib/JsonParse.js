const nearley = require("nearley");
const jsonGrammar = require("./JsonGrammar.js");
const jsonParser = new nearley.Parser(nearley.Grammar.fromCompiled(jsonGrammar));

function jsonArrayToString(arr) {
	let outputString = '';
	for (let index = 0; index < arr.length; index++) {
		let outputObject = '[' + (arr.length - index - 1) + ',' + JSON.stringify(arr[index]) + ']\n';
		outputString += outputObject;
	}
	return outputString;
}

exports.parseInputString = function(inputString) {
	jsonParser.feed(inputString);
	return(jsonArrayToString(jsonParser.results[0].reverse()));
}
