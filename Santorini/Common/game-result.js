/*
  This class represents the result of a single game between
  two players of Santorini.

  ====== Data Definitions ======

  An EndGameReason is one of:
  - "WON"
  - "BROKEN_RULE"
  and represents whether a Player won legitimately, or because
  their opponent broke the rules.

*/
class GameResult {
  /* String String EndGameReason -> GameResult
    Creates a GameResult where the first player beat the second
    player for the given reason.
  */
  constructor(winner, loser, reason) {
    this._winner = winner;
    this._loser = loser;
    this._reason = reason;
  }

  get winner() {
    return this._winner;
  }

  get loser() {
    return this._loser;
  }

  get reason() {
    return this._reason;
  }

  /* Void -> GameResult
    Returns a copy of this GameResult
  */
  copy() {
    return new GameResult(this.winner, this.loser, this.reason);
  }
}