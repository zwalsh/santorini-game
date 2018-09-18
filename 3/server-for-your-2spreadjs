class Spreadsheet {
  // construct a Spreadsheet from a 2D array of rows
  constructor(Formulas) {
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

  evaluate(Reference) {
    // get formula for cell Reference
    try {
      const indices = this.parseReferece(Reference);
      const Formula = this.Formulas[indices[0]][indices[1]];
    } catch (err) {
      throw err;
    }

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
    const firstAtom = atoms[1];
    const operator = atoms[2];
    const secondAtom = atoms[3];

    // evaluate the expression
    if (operator === '+') {
      return this.evaluate(firstAtom) + this.evaluate(secondAtom);
    } else if (operator === '*') {
      return this.evaluate(firstAtom) * this.evaluate(secondAtom);
    } else {
      throw Error;
    }
  }

  // Returns numerical value for row and column index
  // Reference: string representation of coordinate in Spreadsheet.
  //            the format is [column][row] where column is an uppercase letter and row is an int (A = 1, B = 2, ... Z = 26)
  parseReferece(Reference) {
    // find index values for row and column (can be multiple characters)
    const regexp = /([A-Z]+)([0-9]+)/;
    const colPreIndex = Reference.match(regexp)[1];
    const rowPreIndex = Reference.match(regexp)[2];

    let colIndex = 0;
    let rowIndex = parseInt(rowPreIndex, 10);
    // loop through characters of column index
    for (let i = 0; i < colPreIndex.length; i++) {
      colIndex += (colPreIndex[i].charCodeAt(0) - 65) + (i * 26);
    }
    return [colIndex, rowIndex];
  }

  isNumber(possibleNum) {
    return possibleNum.match(/^[0-9]+$/)
  }

  isReference(possibleRef) {
    return possibleRef.match(/^[A-Z]+[0-9]+$/);
  }
};

module.exports = {
  Spreadsheet,
};
