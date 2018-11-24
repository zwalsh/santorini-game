/*
  Server that accepts incoming client connections and runs a
  Santorini tournament between the players.

  The server will wait for a minimum number of players and a
  minimum amount of time before beginning a tournament.

  It can be configured to run a single tournament before shutting down,
  or to continue running new tournaments indefinitely.

  =================== Data Definitions ===================
*/

const net = require('net');

class TournamentServer {

  /* Natural Natural Natural Boolean -> TournamentServer

    Create a TournamentServer with the given configuration options.
      minPlayers : The minimum number of players to wait for
      port       : The port to listen on, in the range [50000, 60000]
      waitingFor : The maximum number of milliseconds to wait for
      repeat     : whether the server should repeat
  */
  constructor(minPlayers, port, waitingFor, repeat, host) {
    this.minPlayers = minPlayers;
    this.port = port;
    this.host = host;
    this.waitingFor = waitingFor;
    this.waitingForTimeout;
    this.repeat = repeat;
    this.sockets = [];
    this.server = this.createServer();
  }

  /* Void -> Void
    Start listening on the port. Starts a timer that will
    shut down the server when it has waited for the specified
    amount of time.
  */
  start() {
    // this.server.listen(host, port);
    // this.waitingForTimeout = this.createWaitingForTimeout();
  }

  /* Void -> Timeout
    Creates the timeout that calls shutdown after waitingFor seconds.
  */
  createTimeout() {

  }

  /* Void -> Server
    Create the networked server that can accept client connections.
   */
  createServer() {
    return new net.Server(this.handleConnection);
  }

  /* Socket -> Void
    Add the incoming socket connection to the list.
    If enough sockets have been received, start the tournament,
    and destroy any more that are received.
  */
  handleConnection(socket) {
    // can receive more socket calls???
    if (this.sockets.length >= this.minPlayers) {
      socket.destroy();
      return;
    }
  }

  /* Void -> Void
    Create a TournamentManager with the players behind the network
    connections. Run the tournament. Shutdown or reset the
    server state when the tournament is over.
  */
  createAndRunTournament() {
    // wrap sockets: GP(RPP(PJS(socket)))
    // clear the timeout
    // tm.run().then(shutdown);
  }

  /* Void -> Void
    Closes all socket connections and closes the server if only one
    tournament is to be played.
  */
  shutdown() {
    // close all connections
    // clear everything out of the socket list
    // clear the timeout
    // if(!repeat)
    // server.close()
  }

  /* PromiseJsonSocket -> Promise<GuardedPlayer>
    Creates a GuardedPlayer out of a PromiseJsonSocket.
    Reject if the player fails to provide a name.
  */
  createPlayerWithSocket(pjs) {
    // use promise protector here
    return this.getPlayerName(pjs).then((name) => {
      //
      new GP(RPP(), null, timeout);
    });
  }

  /* [GuardedPlayer, ...] -> Promise<TournamentManager>
    Creates a TournamentManager that manages a tournament
    between the given list of GuardedPlayers. Ensures
    that all of their names are unique, and only
    creates the TM if at least two players are properly set up.
  */
  createTournamentManager(players) {

  }

  /* PromiseJsonSocket -> Promise<String>
    Gets the player's name out of the PromiseJsonSocket.
  */
  getPlayerName(socket) {
    // use promise protector here
  }
}

module.exports = TournamentServer;