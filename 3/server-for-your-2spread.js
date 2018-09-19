class Spreadsheet {
  // construct a Spreadsheet from a 2D array of rows
  constructor(Formulas) {
    // console.log("sheet in constructor: " + JSON.stringify(Formulas));
    this.Formulas = Formulas;
  }

  set(Reference, Formula) {
    try {
      const indices = this.parseReferece(Reference);
      this.Formulas[indices[0]][indices[1]] = Formula;
    } catch (err) {
      throw err;
    }
  }

  // Note: Returns a string, but they use it like it returns a number within this function
  evaluate(Reference) { // Reference = something like "B4"
    // get formula for cell Reference
    try {
      const indices = this.parseReferece(Reference);
      // console.log("indices: " + JSON.stringify(indices[1]));
      // console.log("sheet: " + JSON.stringify(this.Formulas));
      const Formula = this.Formulas[indices[0]][indices[1]];
      // console.log("their parsed Formula in evaluate(): " + Formula);


          // handle empty string case
          if (Formula == '') {
            return null;
          }

          // handle Atom-number case
          if (this.isNumber(Formula)) {
            return Formula;
          }

          // handle Atom-reference case
          if (this.isReference(Formula)) {
            return this.evaluate(Formula);
          }

          // handle Expression case
          const atoms = Formula.match( /(.+)([+,*])(.+)/);
          // console.log("whole formula: " + JSON.stringify(Formula));
          const firstAtom = atoms[1];
          // console.log("first atom: " + JSON.stringify(firstAtom));
          const operator = atoms[2];
          // console.log("operator: " + JSON.stringify(operator));
          const secondAtom = atoms[3];
          // console.log("second atom: " + JSON.stringify(secondAtom));

          // evaluate the expression
          // They call evaluate() even when the atoms are numbers
          //  misunderstanding data def?
          // console.log("first atom is number? : " + typeof firstAtom);
          // console.log("second atom is number? : " + typeof secondAtom);

          let firstMaybeNum = Number(firstAtom);
          let secondMaybeNum = Number(secondAtom);
          let first = isNaN(firstMaybeNum) ? this.evaluate(firstAtom) : firstMaybeNum;
          let second = isNaN(secondMaybeNum) ? this.evaluate(secondAtom) : secondMaybeNum;

          if (operator === '+') {
            return first + second;
          } else if (operator === '*') {
            return first * second;
          } else {
            throw Error;
          }
    } catch (err) {
      throw err;
    }

  }

  // Returns numerical value for row and column index
  // Reference: string representation of coordinate in Spreadsheet.
  //            the format is [column][row] where column is an uppercase letter and row is an int (A = 1, B = 2, ... Z = 26)
  parseReferece(Reference) {
    // find index values for row and column (can be multiple characters)
    const regexp = /([A-Z]+)([0-9]+)/;
    // console.log("Trying to parse reference: " + Reference);
    const colPreIndex = Reference.match(regexp)[1];
    const rowPreIndex = Reference.match(regexp)[2];

    let colIndex = 0;
    let rowIndex = parseInt(rowPreIndex, 10);
    // loop through characters of column index
    for (let i = 0; i < colPreIndex.length; i++) {
      colIndex += (colPreIndex[i].charCodeAt(0) - 65) + (i * 26);
    }
    return [colIndex, rowIndex-1];
  }

  isNumber(possibleNum) {
    return possibleNum.match(/^[0-9]+$/)
  }

  isReference(possibleRef) {
    return possibleRef.match(/^[A-Z]+[0-9]+$/);
  }
};

module.exports = Spreadsheet;
