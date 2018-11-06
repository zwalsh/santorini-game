/*
  Given a configuration file passed in through stdin,
  create a Tournament according to that specification,
  and run it to completion.

  Print the tournament results to stdout.
  First, print the list of all players who broke in the tournament.
  Then print a list of all the games played between each player, with all of
  the first player's games first, then all of the second player's that
  were not yet printed, etc.

*/

const configureTournament = require('../../Santorini/Admin/configure-tournament').configureTournament;

process.stdin.setEncoding('utf8');

process.stdin.on('readable', () => {
  let chunk = process.stdin.read();
  if (chunk != null) {
    configureAndRunTournament(chunk);
  }
});

/* String -> Void
  Configure a Tournament with the given String, run it,
  and print the results to stdout.
 */
function configureAndRunTournament(configString) {
  return configureTournament(configString).then((tournamentManager) => {
    return tournamentManager.startTournament().then((tournamentResult) => {
      printTournamentResult(tournamentResult);
      return;
    }).catch(() => {
      return;
    });
  });
}

/* TournamentResult -> Void
  Convert the tournament results to a printable format
  and print them to stdout, with the broken players first,
  then a list of games.
*/
function printTournamentResult(tr) {
  let badPlayers = tr.badPlayers;
  let allGames = tr.matchTable.getAllGames();
  process.stdout.write(JSON.stringify(badPlayers) + '\n');
  process.stdout.write(JSON.stringify(allGames) + '\n');
}