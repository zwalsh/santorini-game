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
const PromiseJsonSocket = require('../Lib/promise-json-socket');
const TournamentManager = require('../Admin/tournament-manager');

class TournamentServer {

  /* Natural Natural String Natural Boolean Natural -> TournamentServer

    Create a TournamentServer with the given configuration options.
      minPlayers : The minimum number of players to wait for
      port       : The port to listen on, in the range [50000, 60000]
      host       : The host address to listen on
      waitingFor : The maximum number of milliseconds to wait for
      repeat     : whether the server should repeat
      seriesLength: the length (in games) of a series in the tournament
  */
  constructor(minPlayers, port, host, waitingFor, repeat, seriesLength) {
    this.minPlayers = minPlayers;
    this.port = port;
    this.host = host;
    this.waitingFor = waitingFor;
    this.waitingForTimeout;
    this.repeat = repeat;
    this.sockets = [];
    this.uniquePlayers = [];
    this.seriesLength = seriesLength;
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
    this.waitingForTimeout = setTimeout(this.shutdown, this.waitingFor * 1000);
  }

  /* Void -> Server
    Create the networked server that can accept client connections.
   */
  createServer() {
    return new net.Server(this.handleConnection);
  }

  /* Socket -> Void
    Add the incoming socket connection to the list.
    Attempt to register the player, which will trigger starting
    the tournament.
    If enough players have registered, destroy any more sockets
    that are received.
  */
  handleConnection(socket) {
    if (this.uniquePlayers.length >= this.minPlayers)  {
      socket.destroy();
    } else {
      this.sockets.push(socket);
      this.registerPlayer(new PromiseJsonSocket(socket))
        .then((p) => { this.addAndEnsureUnique(p) })
        .catch(() => { /* remove the socket and destroy */ });
    }
  }

  /* Void -> Void
    Create a TournamentManager with the registered players.
    Run the tournament. Shutdown or reset the server state when the
    tournament is over.
  */
  createAndRunTournament() {

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
  registerPlayer(pjs) {
    // use promise protector here
    return this.getPlayerName(pjs).then((name) => {
      // new GP(RPP(), null, timeout);
    });
  }

  /* GuardedPlayer -> Promise<Void>
    Adds the player to the list of uniquely-named players,
    assigning a unique name if necessary. Rejects if the player
    does not accept a unique name.

    Starts the tournament if this is the last player we are
    waiting for.

    Clears the timeout if enough players have been received and
    registered.
  */
  addAndEnsureUnique(player) {
    
  }

  /* Void -> Boolean
    Determines if the server is ready to start the tournament.
    This is when:
    - enough unique players have registered
    - no more sockets are currently being registered as players
  */
  canStartTournament() {

  }

  /* Void -> Promise<TournamentManager>
    Creates a TournamentManager that manages a tournament
    between the unique players.
  */
  createTournamentManager() {
    return new TournamentManager(this.uniquePlayers, this.seriesLength);
  }

  /* PromiseJsonSocket -> Promise<String>
    Gets the player's name out of the PromiseJsonSocket.
  */
  getPlayerName(socket) {
    // use promise protector here
  }
}

module.exports = TournamentServer;