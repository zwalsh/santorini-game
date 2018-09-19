const Spreadsheet = require('./../../server-for-your-2spread.js');
const JsonParser = require('./lib/JsonParse.js');
const converter = require('./lib/ColumnIndexConverter.js');

let spreadsheets = {}

/*
Converts an operation [Formula, {'+'|'*'},Formula] to the format expected by
the Spreadsheet module, namely a single String with a {number|reference},
followed by an operation character, followed by another {number|reference}.
*/
function convertOperationFormula(operationFormula) {
  return convertFormula(operationFormula[0]) +
          operationFormula[1] +
          convertFormula(operationFormula[2]);
}

/*
Converts a reference ['>', row,col] to the format expected by the Spreadsheet module,
namely a single String with an alphabetical column index followed by a row index.
*/
function convertReference(reference) {
  let alphabeticColIdx = converter.numberToLetters(reference[2]);
    // console.log("converting column index: " + reference[2] + " to " + alphabeticColIdx);
  return alphabeticColIdx + (reference[1] + 1);
}

/*
Converts the input formula (in the form of a Number, or an Array representing
a Reference or an Operation) into the format expected by the Spreadsheet
module (A String).
*/
function convertFormula(formula) {
  if (typeof formula == 'number') {
    return "" + formula;
  }
  if (!Array.isArray(formula)) {
    throw `Invalid formula: ${formula}`;
  }
  if (formula[0] == '>') {
    return convertReference(formula);
  }
  if (formula[1] == '*' || formula[1] == '+') {
    return convertOperationFormula(formula);
  }
  throw `Invalid formula: ${formula}`;
}

/*
 Takes in an array of formulas from the input source and converts them to the
 format expected by the Spreadsheet module. Every cell will be left in the
 proper place, but Formulas must all be converted to Strings.
*/
function convertFormulaArray(formulaArray) {
  // console.log("converting formula array: " + JSON.stringify(formulaArray));
  let convertedArray = [];
  for (let row = 0; row < formulaArray.length; row++) {
    let currentRow = [];
    for (let col = 0; col < formulaArray[row].length; col++) {
      let formula = convertFormula(formulaArray[row][col]);
      // console.log("converted formula: " + JSON.stringify(formula));
      currentRow.push(formula);
    }
    convertedArray.push(currentRow);
  }
  // console.log("fully converted array: " + JSON.stringify(convertedArray));
  return convertedArray;
}

/*
Convert the given spreadsheet representation to the Spreadsheet library
expected format, then create and store the spreadsheet.
--> Input in form of ["sheet", name, formulaArray]
*/
function makeSheet(parsedInput) {
  let name = parsedInput[1];
  let formulaArray = parsedInput[2];
  let array = convertFormulaArray(formulaArray);
  // console.log("array in makeSheet: " + JSON.stringify(array));
  let sheet = new Spreadsheet(array);
  spreadsheets[name] = sheet;
}

/*
Given a formatted evaluation request, convert the [x,y]  cell reference
to a Reference expected by the Spreadsheet library, and return
the result of the evaluation.
*/
function evaluateCell(parsedInput) {
  let sheetName = parsedInput[1];
  let sheet = spreadsheets[parsedInput[1]];
  let cellX = parsedInput[2];
  let cellY = parsedInput[3];
  return sheet.evaluate(convertReference([">", cellX, cellY]));
}

/*
Given a formatted set request, convert the [x,y] cell reference
to a Reference expected by the Spreadsheet library,
convert the given formula to the Spreadsheet library-compatible format,
and set the given value in the named spreadsheet.
*/
function setFormula(parsedInput) {
  let sheet = spreadsheets[parsedInput[1]];
  let reference = convertReference([">", parsedInput[2], parsedInput[3]]);
  let formula = convertFormula(parsedInput[4]);
  sheet.set(reference, formula);
}

/*
Parse the request command and
delegate the action to the appropriate function.
*/
function handleIncomingRequest(request) {
  let command = request[0];
  if (command == 'sheet') {
    makeSheet(request);
  } else if (command == 'at') {
    // NOTE SUZANNE DO NOT DELETE THIS ONE WE NEED IT
    console.log(evaluateCell(request));
  } else if (command == 'set') {
    setFormula(request);
  } else {
    throw `Could not handle request due to invalid command: ${command}`;
  }
}



process.stdin.setEncoding('utf8');

process.stdin.on('readable', () => {
  let chunk = process.stdin.read();
  if (chunk != null) {
    let requests = JsonParser.parseInputString(chunk);
    for (let index in requests) {
      handleIncomingRequest(requests[index]);
    }
  }
});

process.stdin.on('end', function() {
  //process.stdout.write('Good bye! ;)');
});
