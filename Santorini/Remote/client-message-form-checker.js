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

const constants = require('../Common/constants');
const PLAYER_NAME_REGEXP = require('../Admin/player-name-checker').PLAYER_NAME_REGEXP;

/* Any -> Boolean
  Checks if the given value is a valid player name.
*/
function checkName(name) {
  return typeof name === 'string' && PLAYER_NAME_REGEXP.test(name);
}

/* Any -> Boolean
  Check if the given value is a valid Playing-As message.
*/
function checkPlayingAs(playingAs) {
  return Array.isArray(playingAs) &&
    playingAs.length === 2 &&
    playingAs[0] === constants.Message.PLAYING_AS &&
    checkName(playingAs[1]);
}

/* Any -> Boolean
  Checks if the given value is a properly-formed Placement.
*/
function checkPlacement(placement) {
  return Array.isArray(placement) && placement.every(checkWorkerPlace);
}

/* Any -> Boolean
  Checks if the given value is a valid WorkerPlace.
*/
function checkWorkerPlace(workerPlace) {
  return Array.isArray(workerPlace) &&
    workerPlace.length === 3 &&
    checkWorker(workerPlace[0]) &&
    checkCoordinate(workerPlace[1]) &&
    checkCoordinate(workerPlace[2]);
}

/* Any -> Boolean
  Checks if the given value is a valid Worker.
*/
function checkWorker(worker) {
  if (typeof worker !== 'string') {
    return false;
  }
  if (worker.length < 2) {
    return false;
  }
  let workerNumber = Number(worker.substr(worker.length - 1, 1));
  let validNumber = (Number.isInteger(workerNumber) && [1, 2].includes(workerNumber));
  let playerName = worker.substr(0, worker.length - 1);
  return PLAYER_NAME_REGEXP.test(playerName) && validNumber;
}

/* Any -> Boolean
  Checks if the given value is a valid Coordinate.
*/
function checkCoordinate(coord) {
  return Number.isInteger(coord) &&
    0 <= coord <= constants.BOARD_WIDTH;
}

/* Any -> Boolean
  Checks if the given value is a valid JSON Board.
*/
function checkBoard(board) {
  return Array.isArray(board) && board.length === 6 && board.every(checkRow);
}

/* Any -> Boolean
  Checks if the given value is a valid row in a JSON Board.
*/
function checkRow(row) {
  return Array.isArray(row) && row.every(checkCell);
}

/* Any -> Boolean
  Checks if the given value is a valid Cell.
*/
function checkCell(cell) {
  if (Number.isInteger(cell)) {
    return 0 <= cell <= constants.MAX_HEIGHT;
  } else if (typeof cell === 'string') {
    return checkBuildingWorker(cell);
  } else {
    return false;
  }
}

/* Any -> Boolean
  Return true if the given value is a well-formed BuildingWorker.
*/
function checkBuildingWorker(bw) {
  if (typeof bw !== 'string') {
    return false;
  }
  if (bw.length < 3) {
    return false;
  }
  let height = Number(bw.substr(0, 1));
  if (!Number.isInteger(height) || height < 0 || height > constants.MAX_HEIGHT) {
    return false;
  }
  return checkWorker(bw.substr(1));
}

/* Any -> Boolean
  Checks if the given value is a valid list of results.
*/
function checkResults(results) {
  return Array.isArray(results) && results.every(checkEncounterOutcome);
}

/* Any -> Boolean
  Return true if the value is a valid EncounterOutcome.
*/
function checkEncounterOutcome(encounterOutcome) {
  if (!Array.isArray(encounterOutcome)) {
    return false;
  }
  if (encounterOutcome.length < 2) {
    return false;
  }
  if (!checkName(encounterOutcome[0]) || !checkName(encounterOutcome[1])) {
    return false;
  }
  if (encounterOutcome.length === 2) {
    return true;
  } else if (encounterOutcome.length === 3) {
    return encounterOutcome[2] === constants.Message.ENCOUNTER_OUTCOME_IRREGULAR;
  } else {
    return false;
  }
}


module.exports = {
  'checkName': checkName,
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