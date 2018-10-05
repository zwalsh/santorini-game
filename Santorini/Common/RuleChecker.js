/*
This file represents a rule checker for a game of Santorini.

This file provides a single function that allows players and admins 
to check if an action by a player is valid, given the state of the game 
(which includes the state of the board and turn information). 

A rule checker has no internal state of its own, so no class definition is necessary.

Data definitions:

Action is defined in Action.js
GameState is defined in GameState.js

*/

/* GameState Action -> Boolean
Is the given Action valid to take in the current game state?
*/
function validate(gameState, action) {
  return false;
}

module.exports = {
  "validate": validate
};