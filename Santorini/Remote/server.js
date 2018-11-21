/*
  Server that accepts incoming client connections and runs a
  Santorini tournament between the players.

  The server will wait for a minimum number of players and a
  minimum amount of time before beginning a tournament.

  It can be configured to run a single tournament before shutting down,
  or to continue running new tournaments indefinitely.

  =================== Data Definitions ===================
*/

class TournamentServer {

  /* Natural Natural Natural Natural -> TournamentServer

    Create a TournamentServer with the given configuration options.
      minPlayers : The minimum number of players to wait for
      port       : The port to listen on, in the range [50000, 60000]
      waitingFor : The minimum number of seconds to wait for
      repeat     : 0 to run only one tournament, 1 to run indefinitely
  */
  constructor(minPlayers, port, waitingFor, repeat) {
    this.minPlayers = minPlayers;
    this.port = port;
    this.waitingFor = waitingFor;
    this.repeat = repeat;
    this.sockets = [];
    this.server = this.createServer();
  }

  /* Void -> Void
    Start listening on the port.
  */
  start() {

  }

  /* Void -> Server
    Create the networked server that can accept client connections.
   */
  createServer() {

  }

  /* Additional methods
    - callback for handling incoming socket
      - call server.close() after the last socket
    - callback for server closing (if repeat==true, reopen)
    - method to close all socket connections

   */

}

module.exports = TournamentServer;