const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const sinon = require('sinon');
const assert = chai.assert;
const expect = chai.expect;
const GameResult = require('../Common/game-result');
const GuardedPlayer = require('../Admin/guarded-player');
const Player = require('../Player/player');
const TournamentManager = require('../Admin/tournament-manager');
const TournamentResult = require('../Admin/tournament-result');
const constants = require('../Common/constants');

const BROKEN_RULE = constants.EndGameReason.BROKEN_RULE;
const WON = constants.EndGameReason.WON;

describe('TournamentManager', function () {
  let tm, p1, p2, p3, p1Id, p2Id, p3Id, timeout;
  beforeEach(function () {
    timeout = 10; // in ms
    p1Id = 'crosby';
    p2Id = 'stills';
    p3Id = 'nash';
  });

  describe('startTournament', function () {
    // a tournament with 2 players, where p2 is broken

    // tournament result will have match table with 1 game between 2 players
  });
  describe('startMatch', function () {
    // test plan: start a match between two broken players
    //  so that it terminates quickly.
    // mock handleMatchResult to see the results of the series for testing.
  });
  describe('handleMatchResult', function () {

  });

  describe('removeBadPlayers', function () {

  });

  describe('matchOrWaitlistPlayer', function () {
    beforeEach(function () {
      p1 = new GuardedPlayer(new Player(), p1Id, timeout);
      p2 = new GuardedPlayer(new Player(), p2Id, timeout);
      p3 = new GuardedPlayer(new Player(), p3Id, timeout);
      tm = new TournamentManager([p1, p2, p3], 3);
    });

    it('puts player on waitlist if the waitlist is empty', function () {
      tm.matchOrWaitlistPlayer(p1);
      assert.deepEqual(tm.waitingPlayers, [p1]);
    });

    it('puts player on waitlist if they have played everyone else on waitlist', function () {
      tm.matchTable.setMatch(p1Id, p2Id, [new GameResult(p1Id, p2Id, WON)]);
      tm.waitingPlayers = [p1];
      tm.matchOrWaitlistPlayer(p2);
      assert.deepEqual(tm.waitingPlayers, [p1, p2]);
    });

    it('puts player into a new game with the first player they can play from waitlist', function () {
      tm.startMatch = sinon.stub();
      tm.matchTable.setMatch(p1Id, p2Id, [new GameResult(p1Id, p2Id, WON)]);
      tm.waitingPlayers = [p1, p3];

      tm.matchOrWaitlistPlayer(p2);

      let args = tm.startMatch.getCall(0).args;
      assert.equal(args.length, 2);
      assert.isTrue(args.includes(p2));
      assert.isTrue(args.includes(p3));
      assert.isTrue(tm.startMatch.calledOnce);
      // Only player 1 should still be on the waiting list
      assert.deepEqual(tm.waitingPlayers, [p1]);
    });
  });

  describe('isTournamentOver', function () {
    beforeEach(function () {
      p1 = new GuardedPlayer(new Player(), p1Id, timeout);
      p2 = new GuardedPlayer(new Player(), p2Id, timeout);
      p3 = new GuardedPlayer(new Player(), p3Id, timeout);
      tm = new TournamentManager([p1, p2, p3], 3);
    });

    it('returns false if not all players are either on the done list or broken list', function () {
      tm.donePlayers = [p1];
      tm.badPlayers = [p2];
      assert.isFalse(tm.isTournamentOver());
    });
    it('returns true when all players are either on the done list or broken list', function () {
      tm.donePlayers = [p1, p3];
      tm.badPlayers = [p2];
      assert.isTrue(tm.isTournamentOver());
    });
  });
});










