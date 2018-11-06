/*
   This module provides a function that ensures all players in a list have
   unique, proper Santorini names. If any player has an improper name, it
   removes the player from the list. If the player has a non-unique name,
   the later players are renamed with a random name. If the player is not
   successfully renamed, it is removed from the list.

   ================== Data Definitions ==================
   GuardedPlayer is defined in guarded-player.js
*/


const uuid = require('uuid/v4');

const PLAYER_NAME_REGEXP = new RegExp(/^[a-z0-9]*$/);

/* [GuardedPlayer, ...] -> Promise<[GuardedPlayer, ...]>
  Given a list of players, it ensures that all of their names are unique.
  Any players in the list with a non-unique name are given a new name,
  and any players that do not respond correctly when given the new name
  are removed from the tournament.
*/
function ensureUniqueNames(players) {
  let namesInTournament = new Set();
  let playersBeingRenamed = [];
  let uniquePlayers = [];

  for (let player of players) {
    if (!PLAYER_NAME_REGEXP.test(player.getId())) {
      continue;
    }
    if (namesInTournament.has(player.getId())) {
      playersBeingRenamed.push(renamePlayer(player));
    } else {
      uniquePlayers.push(player);
      namesInTournament.add(player.getId());
    }
  }

  return Promise.all(playersBeingRenamed).then((renamedPlayers) => {
    // filter out "players" that are false, since they did not resolve properly
    return uniquePlayers.concat(renamedPlayers.filter(player => player !== false));
  });
}

/* Void -> String
  Returns a unique, uuid-like name that is valid in Santorini (i.e., it has no dashes).
*/
function generateUniqueName() {
  return uuid().replace(/-/g, '');
}

/* GuardedPlayer -> Promise<[Maybe GuardedPlayer]>
  Renames the given player with a unique name. If the player does not accept the new name,
  it returns a Promise that resolves to false.
*/
function renamePlayer(player) {
  return player.setId(generateUniqueName()).then(() => player).catch(() => Promise.resolve(false));
}

module.exports.ensureUniqueNames = ensureUniqueNames;