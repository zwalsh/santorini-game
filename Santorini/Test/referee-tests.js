let assert = require('chai').assert;
let Referee = require('../Common/referee');
let Rulechecker = require('../Common/rulechecker');
let Board = require('../Common/board');

describe('Referee', function () {

  describe('Game playing methods', function () {

    describe('playGame', function () {
      it('notifies both Players of the game start and opponent name');
      describe('when neither Player provides an invalid Turn', function () {
        it('requests Turns from both');
        it('notifies both Players that the winning Player won');
      });
      describe('when a Player provides an invalid Turn', function () {
        it('notifies both Players that the non-rule-breaking Player won');
      });
    });

    describe('playNGames', function () {
      describe('when neither Player provides an invalid Turn', function () {
        it('plays the specified number of Games');
        it('returns the correct GameResult set');
      });
      describe('when a Player provides an invalid Turn', function () {
        it('terminates that game and does not play any more games');
        it('returns the correct GameResult set');
      });
    });

    describe('setup', function () {
      describe('when a Player provides an invalid PlaceRequest', function () {
        it('returns a GameState indicating that the other Player won');
        it('does not create a new Board for the Referee');
      });
      describe('when both Players provide valid PlaceRequests', function () {
        it('requests two PlaceRequests from each Player');
        it('creates a Board with all four workers correctly added to the Referee\'s Board');
        it('returns a GameState indicating that the game should continue');
      });
    });

    describe('getAndApplyTurn', function () {
      describe('when the Player provides a valid non-winning Turn', function () {
        it('applies the player\'s turn to the Board');
        it('returns a GameState indicating that the game should continue');
      });
      describe('when the Player provides a valid winning Turn', function () {
        it('applies the player\'s turn to the Board');
        it('returns a GameState indicating that the Player has won the game');
      })
      describe('when the Player provides an invalid Turn', function () {
        it('does not apply the Turn to the Board');
        it('returns a GameState indicating that the other Player won');
      });
    });

    describe('checkPlaceReq', function () {
      it('rejects a PlaceRequest if it is improperly formed');
      it('rejects a PlaceRequest that is not valid');
      it('accepts a properly formed, valid PlaceRequest');
    });

    describe('checkTurn', function () {
      it('rejects a Turn if it is improperly formed');
      it('rejects a Turn where the WorkerRequest does not match the player');
      it('rejects a Turn that is not valid');
      it('accepts a properly formed, correct-player-referencing, valid Turn');
    });

    describe('flip', function () {
      it('returns the opposite player');
    });
  });


  describe('Data checking methods', function () {
    describe('isWellFormedTurn', function () {
      it('rejects improperly formed Turn');
      it('accepts properly formed Turn');
    });

    describe('isWellFormedPlaceReq', function () {
      it('rejects improperly formed PlaceRequest');
      it('accepts properly formed PlaceRequest');
    });

    describe('isWellFormedMoveReq', function () {
      it('rejects improperly formed MoveRequest');
      it('accepts properly formed MoveRequest');
    });

    describe('isWellFormedBuildReq', function () {
      it('rejects improperly formed BuildRequest');
      it('accepts properly formed BuildRequest');
    });

    describe('isWellFormedWorkerReq', function () {
      it('rejects improperly formed WorkerRequest');
      it('accepts properly formed WorkerRequest');
    });
  });
});