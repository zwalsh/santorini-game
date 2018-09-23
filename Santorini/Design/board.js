/*
This class represents a Santorini game board.
- stores game data: 6x6 board cell heights and player locations
- provides methods for reading and updating game state
- maintains validity of game state by only allowing
    moves that result in another valid game state
- does not track turns or game history

-- Data Definitions --

Workers are referred to using WorkerIds, which are non-negative integers
assigned when a worker is first placed on the board.

Locations are 2-element arrays storing coordinates as [row,col],
where row is the row index and col is the column index.
Row and col indices are integers in the range [0,5].
The pair represents a location on the game board.

Board stores heights as a 6x6 array of arrays of cell heights.
First index indicates row, second index indicates col.
Heights are integers in the range [0,4].

*/

class Board {
  constructor() {
    /* heights is a 2d array of the height of each building on the board */
    this.heights = [[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],
                    [0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0]];
    /* workers is an array of up to 4 worker locations, which are created when
    workers are added to the board. */
    this.workers = [];
  }

  /* Location -> [Maybe WorkerId]
  If the board contains fewer than 4 workers, add another worker
  at the given location.
  Return the WorkerId that identifies the worker placed at that location.
  If location is invalid or board already contains 4 workers, return false.
  */
  addWorker(loc){}

  /* WorkerId Location -> Boolean
  Move the given worker to the given location, if such a move is valid.
  Valid move = - move to adjacent square (one of the 8 neighboring squares)
               - that is not occupied by another worker
               - and that is not more than 1 higher than worker's current loc.
  Returns true/false if the move was/was not successful.
  */
  moveWorker(id, loc){}

  /* WorkerId Location -> Boolean
  Build a floor at the given location, with the given worker, if possible.
  Valid build location = - cell on the board
                         - that is adjacent to given worker's location
                           (adjacent = one of the 8 neighboring squares)
  Returns true/false if the build was/was not successful.
  */
  buildFloor(id, loc){}

  /* Void -> [[Height, ...], ...]
  Returns the heights of every cell on the board,
  in a 2d array.
  */
  getHeights(){}

  /* Void -> [Location, ...]
  Returns the current locations of all players on the board.
  */
  getWorkers(){}










}
