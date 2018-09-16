
module.exports = class Spreadsheet {
  constructor(formulaArray) {

  }

  evaluate(reference) {
    console.log("Evaluate at " + reference);
    return 0;
  }

  set(reference, formula) {
    console.log("Set " + formula + " at " + reference);
  }
}
