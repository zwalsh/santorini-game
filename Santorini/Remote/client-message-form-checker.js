/*
  This module checks the well-formedness of JSON values sent
  as messages from server to client in a networked Santorini
  tournament setting.

  It provides functions for checking the following data definitions:
    - PlayingAs
    - Placement
    - Board
    - Results

  PlayingAs    is a JSON array: ["playing-as", Name]

  Name         is an all-lowercase alphabetic string.

  Placement    is a JSON array: [WorkerPlace, ...] of up to length 3,
               representing a list of already-placed Workers.

  WorkerPlace  is a JSON array: [Worker,Coordinate,Coordinate].

  Worker       is a String of the player's name followed by either
               a 1 or a 2, denoting which of the player's Workers it is.

  Coordinate   is a natural number between 0 and 5 (inclusive).

  Board        is a JSON array: [[Cell, ...], ...]

  Cell         is defined in RuleCheckerHarness.js

  Results      is a list of EncounterOutcome.

  EncounterOutcome is one of:
               - [String, String]: the winner's name, then the loser's
               - [String, String, "irregular"], which is like the first
                 alternative but signals that the losing player misbehaved.

*/

/* Any -> Boolean

*/
function checkPlayingAs(playingAs) {
  return true;
}

/* Any -> Boolean

*/
function checkPlacement(placement) {
  return true;
}

/* Any -> Boolean

*/
function checkWorkerPlace(workerPlace) {
  return true;
}

/* Any -> Boolean

*/
function checkWorker(worker) {
  return true;
}

/* Any -> Boolean

*/
function checkCoordinate(coord) {
  return true;
}

/* Any -> Boolean

*/
function checkBoard(board) {
  return true;
}

/* Any -> Boolean

*/
function checkCell(cell) {
  return true;
}

/* Any -> Boolean

*/
function checkResults(results) {
  return true;
}

/* Any -> Boolean

*/
function checkEncounterOutcome(encounterOutcome) {
  return true;
}


module.exports = {
  'checkPlayingAs': checkPlayingAs,
  'checkPlacement': checkPlacement,
  'checkWorkerPlace': checkWorkerPlace,
  'checkWorker': checkWorker,
  'checkCoordinate': checkCoordinate,
  'checkBoard': checkBoard,
  'checkCell': checkCell,
  'checkResults': checkResults,
  'checkEncounterOutcome': checkEncounterOutcome,
};