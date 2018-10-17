// Represents a Worker game piece. Holds a particular worker's identification and data.
// A worker is identified by the player who owns it and it's ID.
class Worker {
  // Int Int Int String -> Worker
  constructor(x, y, id, player) {
    this.posn = {"x":x, "y":y};
    this.id = id;
    this.player = player;
  }

  // Return true if this worker is on the given x/y
  // Int Int -> Boolean
  isOnTile(x, y) {
    return this.posn.x === x && this.posn.y === y;
  }

  // Set the position of the Worker to the given coordinates
  // Int Int -> Void
  setPosn(x, y) {
    this.posn = {"x":x, "y":y};
  }
}

module.exports = Worker;