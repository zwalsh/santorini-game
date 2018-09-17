const Spreadsheet = require('./lib/Spreadsheet.js');
const JsonParser = require('./lib/JsonParse.js');
const anyBase = require('any-base');
const baseConverter = require('base-converter');

let spreadsheets = {}

function convertOperationFormula(operationFormula) {
  return convertFormula(operationFormula[0]) +
  operationFormula[1] +
  convertFormula(operationFormula[2]);
}

function convertColumnIndexToAlphabetIndex(columnIndex) {
  console.log(baseConverter);
  let alphabeticIndex = baseConverter.decToGeneric(columnIndex, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  console.log("converting column index: " + columnIndex + " to " + alphabeticIndex);
  return alphabeticIndex;
}

/*
Converts a reference to the format expected by the Spreadsheet module, namely
a single String with an alphabetical column index followed by a row index.
*/
function convertReference(reference) {
  return convertColumnIndexToAlphabetIndex(reference[2]) + reference[1];
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
  let convertedArray = [];
  for (let row = 0; row < formulaArray.length; row++) {
    let currentRow = [];
    for (let col = 0; col < formulaArray[0].length; col++) {
      currentRow.concat(convertFormula(formulaArray[row][col]));
    }
    convertedArray.concat(currentRow);
  }
  return convertedArray;
}

// input in form of ["sheet", name, formulaArray]
function makeSheet(parsedInput) {
  let name = parsedInput[1];
  let formulaArray = parsedInput[2];
  let sheet = new Spreadsheet(convertFormulaArray(formulaArray));
  spreadsheets[name] = sheet;
}

function evaluateCell(parsedInput) {
  let sheetName = parsedInput[1];
  let sheet = spreadsheets[parsedInput[1]];
  let cellX = parsedInput[2];
  let cellY = parsedInput[3];
  return sheet.evaluate(convertReference([">", cellX, cellY]));
}

function setFormula(parsedInput) {
  let sheet = spreadsheets[parsedInput[1]];
  let reference = convertReference([">", parsedInput[2], parsedInput[3]]);
  let formula = convertFormula(parsedInput[4]);
  sheet.set(reference, formula);
}

function handleIncomingRequest(request) {
  console.log('received: ' + JSON.stringify(request));
  let command = request[0];
  console.log('command: ' + command);
  if (command == 'sheet') {
    makeSheet(request);
  } else if (command == 'at') {
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
    console.log('received chunk: ' + chunk);
    let requests = JsonParser.parseInputString(chunk);
    console.log('parsed into ' + requests.length + ' requests: ' + JSON.stringify(requests));
    for (let index in requests) {
      handleIncomingRequest(requests[index]);
    }
  }
});

process.stdin.on('end', function() {
  process.stdout.write('done');
});
