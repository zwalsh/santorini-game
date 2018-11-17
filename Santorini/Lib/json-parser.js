const nearley = require('nearley');
const grammar = require('./jsongrammar');

// Robust string-to-JSON parser, supporting multiple JSON inputs in nearly any format.
// If multiple JSON objects or arrays are submitted in one input, they are in order in the output list.
// String -> ListOfJSON
module.exports.jsonParser = function (input) {
  let parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  parser.feed(input.trim());
  if (parser.results.length !== 0) {
    let res = parser.results;
    return res[0];
  } else {
    return [];
  }
};