/*
Definition of Coordinates

Cell coordinates in the spreadsheet are pairs of numbers (x,y)
where x refers to the row index and y refers to the column index.
Example of spreadsheet coordinate pairs that correspond to their
respective locations:
0,0  0,1  0,2 ...
1,0  1,1  1,2 ...
2,0  2,1  2,2 ...
...
As shown in the example, row and col indices begin at 0.
*/

/* A Formula contains one of:
- Number
- Reference
- Operation
A Reference is a 2-number array, representing an (x,y)
    coordinate pair in a spreadsheet
An Operation is a 3-element array, where the 1st and 3rd elements
    are Formulas, and the 2nd element is '+' or '*',
    representing an addition or multiplication operation
*/
class Formula {

  constructor(formula) {
    if (Formula.isValidNumber(formula)) {
      this.contents = formula;
      this.type = 'number';
    } else if (Formula.isValidReference(formula)) {
      this.contents = formula;
      this.type = 'reference';
    } else if (Formula.isValidOperation(formula)) {
      this.contents = formula;
      this.type = 'operation';
    } else {
      throw `Invalid Formula contents: ${formula}`;
    }
  }

  getType() {
    return this.type;
  }

  getContents() {
    return this.contents;
  }

  static isValidFormula(f) {
    let contents = f.getContents();
    return Formula.isValidNumber(contents) ||
    Formula.isValidReference(contents) ||
    Formula.isValidOperation(contents);
  }


  /* Is n a valid number? */
  static isValidNumber(n) {
    return typeof n == 'number';
  }

  /* Is ref a valid Reference? */
  static isValidReference(ref) {
    return Array.isArray(ref) && ref.length == 2
        && typeof ref[0] == 'number' && typeof ref[1] == 'number';
  }

  /* Is op a valid Operation? */
  static isValidOperation(op) {
    return Array.isArray(op) && op.length == 3
        && Formula.isValidFormula(op[0]) && Formula.isValidFormula(op[2])
        && (op[1] == '+' || op[1] == '*');
  }
};


class Spreadsheet {

  /* Constructor validates the input dataArray.
  Each cell in the given 2d array may be 'empty' (undefined/null)
  or an object with formula, x, and y fields,
  where formula may be null, undefined, or a Formula,
  and x and y must be numbers. */
  constructor(dataArray) {
    for (let r = 0; r < dataArray.length; r++) {
      let row = dataArray[r];
      for (let c = 0; c < row.length; c++) {
        let cell = row[c];
        if (cell !== null && cell !== undefined) {
          let keys = Object.keys(cell);
          if (!keys.includes('formula')) {
            throw `Invalid spreadsheet: cell at row ${r}, col ${c} missing 'formula' property`;
          } else if (!keys.includes('x')) {
            throw `Invalid spreadsheet: cell at row ${r}, col ${c} missing 'x' property`;
          } else if (!keys.includes('y')) {
            throw `Invalid spreadsheet: cell at row ${r}, col ${c} missing 'y' property`;
          } else if (cell.formula !== undefined && cell.formula !== null
                     && !(cell.formula instanceof Formula)) {
            throw `Invalid spreadsheet: cell at row ${r}, col ${c} contains non-Formula value`;
          } else if (!typeof cell.x == 'number' || !typeof cell.y == 'number') {
            throw `Invalid spreadsheet: cell at row ${r}, col ${c} contains non-numeric coordinates`;
          }
        }
      }
    }
    // After input has been validated, we may store it.
    this.data = dataArray;
    // Also store spreadsheet size metadata for convenience
    this.rowCount = dataArray.length;
    this.colCount = this.rowCount > 0 ? dataArray[0].length : 0;
  }

  /* Check if the coordinates are in this spreadsheet. */
  containsLoc(x, y) {
    let xInBounds = x >= 0 && x < this.rowCount;
    let yInBounds = y >= 0 && y < this.colCount;
    return xInBounds && yInBounds;
  }

  /* Given a cell's coordinates, calculate that cell's value.
  If the cell or one of its references contains a reference to
  a cell not in the sheet, throw an error.
  */
  calculateValue(x, y) {
    if (this.containsLoc(x,y)) {
      let cell = this.data[x][y];
      // Empty cells evaluate to 0.
      if (cell === undefined || cell === null ||
          cell.formula === undefined || cell.formula === null) {
        return 0;
      }
      // todo - maybe try/catch here and throw error with location
      return this.calculateFormula(cell.formula);
    } else {
      throw `Cell location (${x},${y}) not in spreadsheet`;
    }
  }

  /*
  Takes in a Formula and determines its numeric value, recursing if necessary
  as a Formula may contain nested formulas.
  */
  calculateFormula(formula) {
    if (formula.getType() == 'reference') {
      return this.calculateReference(formula.getContents());
    } else if (formula.getType() == 'operation') {
      return this.calculateOperation(formula.getContents());
    } else {
      // formula.getType() == number
      return formula.getContents();
    }
  }

  /* Helper for calculateValue.
  Calculate the value of the reference in this spreadsheet,
  or throw an error if the reference points to a cell not in the sheet.
  x and y are the coordinates of the cell that contained ref. */
  calculateReference(ref) {
    if (this.containsLoc(ref[0], ref[1])) {
      return this.calculateValue(ref[0], ref[1]);
    } else {
      throw `Cell at (${x}, ${y}) contains out-of-bounds reference: ${ref}`;
    }
  }

  calculateOperation(operation) {
    let formula1 = operation[0];
    let formula2 = operation[2];
    let op = operation[1];
    // if number, number
    // else, check then calculate reference
    let num1 = this.calculateFormula(formula1);
    let num2 = this.calculateFormula(formula2);
    if (op == '+') {
      return num1 + num2;
    } else {
      // op == '*'
      return num1 * num2;
    }
  }

  /* Given a cell's coordinates, place the given formula f
  into that cell in the spreadsheet.
  If a coordinate set is not provided, place f into the first empty
  cell in the first row with an empty cell. */
  placeFormula(x, y, f) {
    if (!(f instanceof Formula || f === undefined || f === null)) {
      throw `Invalid formula: ${f}`;
    }


    if (x === undefined || x === null || y === undefined || y === null) {
      this.placeInEmptyCell(f);
    } else if (this.containsLoc(x, y)) {
      let cell = this.data[x][y];
      if (!cell) {
        cell = {'x':x,'y':y}
      }
      cell.formula = f;
    } else {
      throw `Cell location (${x},${y}) out of bounds`;
    }
  }

  /* Helper for placeFormula.
  Find the first empty cell in the first row in this sheet
  with an empty cell, and place f in that cell if it exists. */
  placeInEmptyCell(f) {
    for (let r = 0; r < this.rowCount; r++) {
      let row = this.data[r];
      for (let c = 0; c < this.colCount; c++) {
        let cell = row[c];
        if (!cell) {
          this.data[r][c] = {'x':r,'y':c,'formula':f}
          return;
        } else if (!cell.formula) {
          this.data[r][c].formula = f;
          return;
        }
      }
    }
  }
};

module.exports = {
  'Spreadsheet' : Spreadsheet,
  'Formula' : Formula
}
