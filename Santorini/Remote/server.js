/*
  Server that accepts incoming client connections and runs a
  Santorini tournament between the players.

  The server will wait for a minimum number of players and a
  minimum amount of time before beginning a tournament.

  It can be configured to run a single tournament before shutting down,
  or to continue running new tournaments indefinitely. When it is
  configured to run a single tournament, it can optionally be started
  with a function that will return the single tournament's result.

  =================== Data Definitions ===================

  GuardedPlayer is defined in Admin/guarded-player.js.
  PromiseJsonSocket is defined in Lib/promise-json-socket.js.
  TournamentManager is defined in Admin/tournament-manager.js.
  TournamentResult is defined in Admin/tournament-result.js.

*/

const net = require('net');
const PromiseJsonSocket = require('../Lib/promise-json-socket');
const TournamentManager = require('../Admin/tournament-manager');
const GuardedPlayer = require('../Admin/guarded-player');
const RemoteProxyPlayer = require('./remote-proxy-player');
const renamePlayer = require('../Admin/player-name-checker').renamePlayer;
const PLAYER_NAME_REGEXP = require('../Admin/player-name-checker').PLAYER_NAME_REGEXP;
const protectedPromise = require('../Lib/promise-protector');
const constants = require('../Common/constants');

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
    this.resolveWithTournamentResult = null;
    this.server = this.createServer();
  }

  /* Void -> Void
    Start listening on the port. Starts a timer that will
    shut down the server when it has waited for the specified
    amount of time.
  */
  start() {
    this.server.listen(this.port, this.host);
    this.waitingForTimeout = this.createTimeout();
  }

  /* Void -> Promise<TournamentResult>
    Start the server, and also return the results of the last tournament run.
    When the TournamentServer is set to continuously run tournaments,
    this method behaves the same as start() because it never returns.
   */
  startAndReturnResults() {
    this.start();
    return new Promise((resolve, reject) => {
      this.resolveWithTournamentResult = resolve;
      return;
    });
  }

  /* Void -> Timeout
    Creates the timeout that calls shutdown after waitingFor seconds.
  */
  createTimeout() {
    return setTimeout(() => { return this.shutdown(); }, this.waitingFor);
  }

  /* Void -> Server
    Create the networked server that can accept client connections.
   */
  createServer() {
    return new net.Server((socket) => { return this.handleConnection(socket); } );
  }

  /* Socket -> Promise<Void>
    Add the incoming socket connection to the list.
    Attempt to register the player, which will trigger starting
    the tournament.
    If enough players have registered, destroy any more sockets
    that are received.
  */
  handleConnection(socket) {
    if (this.uniquePlayers.length >= this.minPlayers)  {
      socket.end();
      return Promise.resolve();
    } else {
      this.sockets.push(socket);
      return this.registerPlayer(this.wrapSocket(socket))
        .then((p) => { return this.addAndEnsureUnique(p); })
        .catch(() => {
          this.sockets.splice(this.sockets.indexOf(socket), 1);
          socket.end();
          return;
        });
    }
  }

  /* Void -> Promise<Void>
    Create a TournamentManager with the registered players.
    Run the tournament. Shutdown or reset the server state when the
    tournament is over. Print the results if a resolution function is waiting.
  */
  createAndRunTournament() {
    let tm = this.createTournamentManager();
    return tm.startTournament().then((tournamentResult) => {
      if (this.resolveWithTournamentResult) {
        this.resolveWithTournamentResult(tournamentResult);
        this.resolveWithTournamentResult = null;
      }
      return this.shutdown();
    });
  }

  /* Void -> Void
    Closes all socket connections and clears the socket list.
    If only one tournament is to be played, closes the server.
  */
  shutdown() {
    for (let socket of this.sockets) {
      socket.end();
    }
    this.sockets = [];
    if (!this.repeat) {
      this.server.close();
    }
  }

  /* PromiseJsonSocket -> Promise<GuardedPlayer>
    Creates a GuardedPlayer out of a PromiseJsonSocket.
    Reject if the player fails to provide a name.
  */
  registerPlayer(pjs) {
    return this.getPlayerName(pjs).then((name) => {
      return new GuardedPlayer(new RemoteProxyPlayer(pjs, name), name, constants.DEFAULT_TIMEOUT);
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
    return this.uniquelyNamedPlayer(player).then((uniquePlayer) => {
      this.uniquePlayers.push(uniquePlayer);
      if (this.uniquePlayers.length === this.minPlayers) {
        clearTimeout(this.waitingForTimeout);
      }
      if (this.canStartTournament()) {
        this.createAndRunTournament();
      }
      return;
    });
  }

  /* GuardedPlayer -> Promise<GuardedPlayer>
    Returns the given player, with a name that is guaranteed to be
    unique.

    If the player is not uniquely named, it renames the player, and
    rejects if the player does not accept the new name.
  */
  uniquelyNamedPlayer(player) {
    let currentNames = this.uniquePlayers.map((p) => { return p.getId() });
    if (currentNames.includes(player.getId())) {
      return renamePlayer(player).then((maybePlayer) => {
        if (maybePlayer) {
          return Promise.resolve(maybePlayer);
        } else {
          return Promise.reject();
        }
      });
    } else {
      return Promise.resolve(player);
    }
  }

  /* Void -> Boolean
    Determines if the server is ready to start the tournament.
    This is when:
    - enough unique players have registered
    - no more sockets are currently being registered as players
  */
  canStartTournament() {
    let playerCount = this.uniquePlayers.length;
    return playerCount >= this.minPlayers &&
      playerCount === this.sockets.length;
  }

  /* Void -> Promise<TournamentManager>
    Creates a TournamentManager that manages a tournament
    between the unique players.
  */
  createTournamentManager() {
    return new TournamentManager(this.uniquePlayers, this.seriesLength);
  }

  /* Socket -> PromiseJsonSocket
    Wraps the socket in a PromiseJsonSocket
  */
  wrapSocket(socket) {
    return new PromiseJsonSocket(socket);
  }

  /* PromiseJsonSocket -> Promise<String>
    Gets the player's name out of the PromiseJsonSocket.
  */
  getPlayerName(socket) {
    // use promise protector here
    return protectedPromise(socket, (pjs) => {
      return pjs.readJson();
    }).then((val) => {
      if (this.checkPlayerName(val)) {
        return val;
      } else {
        return Promise.reject(new Error('Player failed to provide a name.'));
      }
    });
  }

  /* JSON -> Boolean
    Returns true if the value is a proper player name
  */
  checkPlayerName(name) {
    return typeof name === 'string' && PLAYER_NAME_REGEXP.test(name);
  }
}

module.exports = TournamentServer;