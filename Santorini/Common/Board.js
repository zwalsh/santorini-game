/*
This class represents a Santorini game board. It:
- stores game data: 6x6 board cell heights and player locations
- provides methods for reading and updating game state
- maintains validity of board state by only allowing
    moves that result in another valid board state
- does not ensure validity of changes made to board state, only ensures
    validity of resulting board state
- does not track turns or game history

-- Data Definitions --

A Worker is represented by a Location on the Board.
Workers are referred to using WorkerIds, which are non-negative integers
assigned when a Worker is first placed on the Board.

Locations are 2-element arrays storing coordinates as [row,col],
where row is the row index and col is the column index.
Row and col indices are integers in the range [0,5].
The pair represents a location on the game board.

Board stores heights as a 6x6 array of arrays of cell heights.
First index into the heights array indicates row, second index indicates col.
Heights are integers in the range [0,4].

BoardIndex is a number in the range [0,5].

*/

class Board {
  constructor() {
    /* The maximum height of a cell in this Board */
    this.MAX_HEIGHT = 4;
    /* The length/width of this Board */
    this.BOARD_SIZE = 6;
    /* The maximum number of Workers in a Board */
    this.MAX_WORKERS = 4;

    /* heights is a 2d array of the height of each building on the board */
    this.heights = [];
    for (let row = 0; row < this.BOARD_SIZE; row++) {
      let currentRow = [];
      for (let col = 0; col < this.BOARD_SIZE; col++) {
        currentRow.push(0);
      }
      this.heights.push(currentRow);
    }

    /* workers is an array of up to 4 worker locations, which are created when
    workers are added to the board. */
    this.workers = [];
  }

  /* BoardIndex BoardIndex -> [Maybe WorkerId]
  If the board contains fewer than 4 workers, add another worker
  at the given location (x,y)
  Return the WorkerId that identifies the worker placed at that location.
  If location is invalid or board already contains 4 workers, return false.
  */
  addWorker(x, y){
    if (this.workers.length >= this.MAX_WORKERS) {
      return false;
    }
    if (!this.isValidUnoccupiedLoc(x, y)) {
      return false;
    }
    // now we can add the worker
    this.workers.push([x, y]);
    return this.workers.length - 1;
  }

  /* WorkerId BoardIndex BoardIndex -> Boolean
  Move the given worker to the given location (x,y), if such a move is valid.
  Valid move = move to a square that is not occupied by another worker
  Returns true/false if the move was/was not successful.
  */
  moveWorker(id, x, y) {
    // worker exists
    if (id < 0 || id >= this.workers.length) {
      return false;
    }
    // destination is on the board and empty
    if (!this.isValidUnoccupiedLoc(x, y)) {
      return false;
    }
    this.workers[id] = [x, y];
    return true;
  }

  /* WorkerId BoardIndex BoardIndex -> Boolean
  Build a floor at the given location (x,y), with the given worker, if possible.
  Valid build location = - cell on the board
                         - not occupied by another worker
  Returns true/false if the build was/was not successful.
  */
  buildFloor(id, x, y) {
    // worker exists
    if (id < 0 || id >= this.workers.length) {
      return false;
    }
    // destination is on the board and empty
    if (!this.isValidUnoccupiedLoc(x, y)) {
      return false;
    }
    // the height of the cell being built on is below the max height
    if (this.heights[x][y] == this.MAX_HEIGHT) {
      return false;
    }
    this.heights[x][y] = this.heights[x][y] + 1;
    return true;
  }

//-------- Getters ---------

  /* BoardIndex BoardIndex -> [Maybe Height]
  Returns the height of the given cell in this Board,
  if the cell exists.
  */
  getHeight(x, y){
    if (!this.isValidLoc(x, y)) {
      return false;
    }
    return this.heights[x][y];
  }

  /* Void -> [[Height, ...], ...]
  Returns a copy of the heights of every cell on the board,
  in a 2d array.
  */
  getHeights(){
    let heightsCopy = [];
    for (let rowIdx = 0; rowIdx < this.getSize(); rowIdx++) {
      let row = []
      for (let colIdx = 0; colIdx < this.getSize(); colIdx++) {
        let cellHeight = this.heights[rowIdx][colIdx];
        row.push(cellHeight);
      }
      heightsCopy.push(row);
    }
    return heightsCopy;
  }

  /* WorkerId -> Location
  Returns a copy of the location of the given worker,
  if this board has a worker with that id.
  */
  getWorker(idx) {
    if (idx >= 0 && idx < this.workers.length) {
      let loc = this.workers[idx];
      let locCopy = [loc[0], loc[1]];
      return locCopy;
    } else {
      throw 'Invalid worker ID: ' + idx;
    }
  }

  /* Void -> [Location, ...]
  Returns a copy of the current locations of all players on the board.
  */
  getWorkers(){
    let workersCopy = [];
    for (let i  = 0; i < this.workers.length; i++) {
      workersCopy.push(this.getWorker(i));
    }
    return workersCopy;
  }

  /* Void -> Number
  Return the side length of this board.
  */
  getSize(){ return this.BOARD_SIZE; }

  /* Void -> Board
  Return a deep copy of this Board. 
  */
  copy() {
    let brd = new Board();
    brd.heights = this.getHeights();
    brd.workers = this.getWorkers();
    return brd;

  }

//------- Helper functions for main methods -------

  /* Is the location on the game board? */
  isValidLoc(x, y) {
    let size = this.getSize();
    return x >= 0 && x < size && y >= 0 && y < size;
  }

  /* Is the location on the game board and not occupied by any worker? */
  isValidUnoccupiedLoc(x, y) {
    if (!this.isValidLoc(x, y)) {
      return false;
    }
    for (let workerLoc of this.workers) {
      if (workerLoc[0] == x && workerLoc[1] == y) {
        return false;
      }
    }
    return true;
  }
}

module.exports = Board;