/* Represents a Player in a game of Santorini, which is carried through the various phases of the game.
  It produces Turns and places Workers (as appropriate) when it is requested to do so,
  and when it is given an update on the current state of the game.

  This implementation delegates to a Player on the other side of a network connection.

  Data Definitions: See Common/player-interface.js
*/

const MessageConverter = require('./server-message-converter');

class RemoteProxyPlayer {
  /* PromiseJsonSocket String -> RPP
    Instantiates a RPP that uses a PromiseJsonSocket to communicate
    with the Player with the given name on the other side of the network.
  */
  constructor(client, name) {
    this.client = client;
    this.name = name;
  }

  /* String -> Promise<Void>
    Set this player's ID to the given identifier.
    Return a Promise that resolves to indicate receipt of the name.
  */
  setId(id) {
    this.name = id;
    this.client.sendJson(MessageConverter.nameToJson(id));
    return Promise.resolve();
  }

  /* [InitWorker, ...] -> Promise<PlaceRequest>
    Given the list of worker locations that have already been claimed on the Board,
    produce a PlaceRequest representing where this Player would like to put
    their next Worker.
  */
  placeInitialWorker(existingWorkers) {
    return this.clientRequest(existingWorkers, MessageConverter.initWorkerListToJson,
      MessageConverter.jsonToPlaceRequest);
  }

  /* Board -> Promise<Turn>
    Given the current state of the game board, produce the Turn that
    this Player wishes to take.
  */
  takeTurn(board) {
    return this.clientRequest(board, MessageConverter.boardToJson,
      MessageConverter.jsonToTurn);
  }

  /* String -> Promise<Void>
    Notify this Player that they have been put into a new game,
    against an opponent with the given ID.
  */
  newGame(opponentId) {
    console.log(this.name + ' starting game against ' + opponentId);
    this.client.sendJson(opponentId);
    return Promise.resolve();
  }

  /* GameResult -> Promise<Void>
    Notify this Player of the result of a game they played,
    so that internal information can be reset/updated as necessary
  */
  notifyGameOver(gameResult) {
    // Send nothing, because there is no message specified to send
    // to the client when a single game ends.
    // Resolve so that callers know the notification did not fail.
    return Promise.resolve();
  }

  /* [GameResult, ...] -> Promise<Void>
    Notify this Player of the results of a tournament,
    in the form of a list of the results every game played.
  */
  notifyTournamentOver(gameResults) {
    let encounterOutcomes = MessageConverter.gameResultsToJson(gameResults);
    this.client.sendJson(encounterOutcomes);
    return Promise.resolve();
  }

  /* X [X -> JSON] [JSON -> Y] -> Promise<Y>
    Convert the given data to JSON, send it to the client, and return
    the decoded response.
  */
  clientRequest(requestValue, encodeRequestFn, decodeResponseFn) {
    let json = encodeRequestFn(requestValue);
    this.client.sendJson(json);
    return this.client.readJson()
      .then(decodeResponseFn);
  }
}

module.exports = RemoteProxyPlayer;