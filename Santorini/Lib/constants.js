module.exports = Object.freeze({
  MAX_PLAYERS: 2,
  NUM_WORKERS: 4,
  MAX_HEIGHT: 4,
  BOARD_WIDTH: 6,
  BOARD_HEIGHT: 6,
  MAX_FLOORS_PER_MOVE: 1,
  WINNING_HEIGHT: 3, // Winning height is 1 less than max height
  EndGameReason: {
    WON: "WON",
    BROKEN_RULE: "BROKEN_RULE",
  },
  GameState: {
    IN_PROGRESS: "IN_PROGRESS"
  }
});
