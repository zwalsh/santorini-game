const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const sinon = require('sinon');
const assert = chai.assert;
const testlib = require('./test-lib');
const GameResult = require('../Common/game-result');
const GuardedPlayer = require('../Admin/guarded-player');
const Player = require('../Player/player');
const TournamentManager = require('../Admin/tournament-manager');
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
    p1 = new GuardedPlayer(new Player(p1Id), p1Id, timeout);
    p2 = new GuardedPlayer(new Player(p2Id), p2Id, timeout);
    p3 = new GuardedPlayer(new Player(p3Id), p3Id, timeout);
  });

  describe('startTournament', function () {
    let startTournamentPromise;
    beforeEach(function () {
      tm = new TournamentManager([p1, p2, p3], 3);
      tm.matchOrStorePlayer = sinon.stub();
      startTournamentPromise = tm.startTournament();
    });
    it('calls matchOrStorePlayer with each player in the tournament', function () {
      assert.equal(tm.matchOrStorePlayer.callCount, 3);
      assert.isTrue(tm.matchOrStorePlayer.calledWith(p1));
      assert.isTrue(tm.matchOrStorePlayer.calledWith(p2));
      assert.isTrue(tm.matchOrStorePlayer.calledWith(p3));
    });
    it('sets the resolveTournament callback', function () {
      // Since resolveTournament is set inside of a Promise,
      // must schedule any assertions about it to occur after it is set,
      // which we are trying to use another Promise to do
      return new Promise(resolve => {
        assert.isNotNull(tm.resolveTournament);
        return resolve();
      });
    });
  });

  describe('startMatch', function () {
    let mockRef,matchPromise, p1p2MatchResult;
    beforeEach(function () {
      // create a mock referee and have createReferee return it,
      // so that we can access the callback given to its .then() call
      mockRef = testlib.createMockObject('playNGames');
      p1p2MatchResult = [new GameResult(p1Id, p2Id, WON)];
      let playNGamesResult = new Promise((resolve) => {
        return resolve(p1p2MatchResult);
      });
      mockRef.playNGames.returns(playNGamesResult);
      tm.createReferee = sinon.stub().returns(mockRef);


      tm.handleMatchResult = sinon.stub();
      matchPromise = tm.startMatch(p1, p2);
    });

    it('creates a Referee with the appropriate players', function () {
      assert.isTrue(tm.createReferee.calledWith(p1, p2));
    });
    it('calls the handleMatchResult callback when the referee finishes the series', function () {
      return matchPromise.then(() => {
        return assert.isTrue(tm.handleMatchResult.calledWith(p1, p2, p1p2MatchResult));
      });
    });
  });

  describe('handleMatchResult', function () {
    let setMatchMock, dqBadPlayersMock, matchOrWaitlistMock, isTourneyOverMock, endTourneyMock;
    beforeEach(function () {
      tm = new TournamentManager([p1, p2, p3], 3);
      setMatchMock = sinon.stub();
      dqBadPlayersMock = sinon.stub();
      matchOrWaitlistMock = sinon.stub();
      isTourneyOverMock = sinon.stub();
      endTourneyMock = sinon.stub();

      tm.matchTable.setMatch = setMatchMock;
      tm.disqualifyBadPlayers = dqBadPlayersMock;
      tm.matchOrStorePlayer = matchOrWaitlistMock;
      tm.isTournamentOver = isTourneyOverMock;
      tm.endTournament = endTourneyMock;
    });
    describe('when neither player has cheated and the tournament is over', function () {
      beforeEach(function () {
        dqBadPlayersMock.returns([]);
        tm.isTournamentOver.returns(true);
        tm.handleMatchResult(p1, p2, [new GameResult(p1Id, p2Id, WON)]);
      });
      it('calls all helper functions in order', function () {
        assert.isTrue(setMatchMock.calledImmediatelyBefore(dqBadPlayersMock));
        assert.isTrue(dqBadPlayersMock.calledBefore(matchOrWaitlistMock));
        assert.isTrue(matchOrWaitlistMock.calledWith(p1));
        assert.isTrue(matchOrWaitlistMock.calledWith(p2));
        assert.isTrue(matchOrWaitlistMock.calledTwice);
        assert.isTrue(matchOrWaitlistMock.calledBefore(isTourneyOverMock));
        assert.isTrue(isTourneyOverMock.calledImmediatelyBefore(endTourneyMock));
      });
    });
    describe('when a player cheated in the match', function () {
      beforeEach(function () {
        dqBadPlayersMock.returns([p2]);
        tm.isTournamentOver.returns(false);
        tm.handleMatchResult(p1, p2, [new GameResult(p1Id, p2Id, BROKEN_RULE)]);
      });
      it('does not match or waitlist that player', function () {
        assert.isTrue(matchOrWaitlistMock.calledWith(p1));
        assert.isFalse(matchOrWaitlistMock.calledWith(p2));
        assert.isTrue(matchOrWaitlistMock.calledOnce);
      });
      it('adds the bad player to the TM\'s list of bad players', function () {
        assert.deepEqual(tm.badPlayers, [p2]);
      });
    });
    describe('when the tournament is not over', function () {
      beforeEach(function () {
        dqBadPlayersMock.returns([]);
        tm.isTournamentOver.returns(false);
        tm.handleMatchResult(p1, p2, [new GameResult(p1Id, p2Id, WON)]);
      });
      it('does not call endTournament', function () {
        assert.isFalse(endTourneyMock.called);
      });
    });
  });

  describe('addWaitingPlayersToDoneList', function () {
    let p4Id, p4;
    /* Scenario:
      p1-p4, p1-p2 clean matches already finished
      p3-p4 dirty match just finished.
      p3 cheated and was added to bad players list
     */
    beforeEach(function () {
      p4Id = 'young';
      p4 = new GuardedPlayer(new Player(p4Id), p4Id, timeout);
      tm = new TournamentManager([p1, p2, p3, p4], 3);
      let remainingOppsFn = sinon.stub();
      remainingOppsFn.withArgs(p1).returns([]);
      remainingOppsFn.withArgs(p2).returns([p4]);
      tm.getPlayerRemainingOpponents = remainingOppsFn;
      tm.waitingPlayers = [p1, p2];
      tm.badPlayers = [p3];

      tm.addWaitingPlayersToDoneList();
    });
    it('moves players to done list if they have no remaining opponents', function () {
      assert.isTrue(tm.donePlayers.includes(p1));
      assert.isFalse(tm.waitingPlayers.includes(p1));
    });
    it('leaves players with remaining opponents on the wait list', function () {
      assert.isFalse(tm.donePlayers.includes(p2));
      assert.isTrue(tm.waitingPlayers.includes(p2));
    });
  });

  describe('disqualifyBadPlayers', function () {
    beforeEach(function () {
      tm = new TournamentManager([p1, p2, p3], 3);
    });
    it('if neither player broke or cheated, does not return them', function () {
      let match = [new GameResult(p1Id, p2Id, WON)];
      tm.matchTable.setMatch(p1Id, p2Id, match);
      let badPlayers = tm.disqualifyBadPlayers(p1, p2);
      assert.equal(badPlayers.length, 0);
    });
    it('if one player broke or cheated, returns a list of only that player', function () {
      let match = [new GameResult(p1Id, p2Id, BROKEN_RULE)];
      tm.matchTable.setMatch(p1Id, p2Id, match);
      let badPlayers = tm.disqualifyBadPlayers(p1, p2);
      assert.deepEqual(badPlayers, [p2]);
    });
    it('if both players broke or cheated, returns a list of both players', function () {
      let match = [];
      tm.matchTable.setMatch(p1Id, p2Id, match);
      let badPlayers = tm.disqualifyBadPlayers(p1, p2);
      assert.deepEqual(badPlayers, [p1, p2]);
    });
  });

  describe('matchOrStorePlayer', function () {
    beforeEach(function () {
      tm = new TournamentManager([p1, p2, p3], 3);
    });

    it('puts player on waitlist if the waitlist is empty', function () {
      tm.matchOrStorePlayer(p1);
      assert.deepEqual(tm.waitingPlayers, [p1]);
    });

    it('puts player on waitlist if they have played everyone else on waitlist', function () {
      tm.matchTable.setMatch(p1Id, p2Id, [new GameResult(p1Id, p2Id, WON)]);
      tm.waitingPlayers = [p1];
      tm.matchOrStorePlayer(p2);
      assert.deepEqual(tm.waitingPlayers, [p1, p2]);
    });

    it('puts player into a new game with the first player they can play from waitlist', function () {
      tm.startMatch = sinon.stub();
      tm.matchTable.setMatch(p1Id, p2Id, [new GameResult(p1Id, p2Id, WON)]);
      tm.waitingPlayers = [p1, p3];

      tm.matchOrStorePlayer(p2);

      assert.isTrue(tm.startMatch.called);
      let args = tm.startMatch.getCall(0).args;
      assert.equal(args.length, 2);
      assert.isTrue(args.includes(p2));
      assert.isTrue(args.includes(p3));
      assert.isTrue(tm.startMatch.calledOnce);
      // Only player 1 should still be on the waiting list
      assert.deepEqual(tm.waitingPlayers, [p1]);
    });

    it('puts player on the done list if they have no more opponents to play', function () {
      tm.startMatch = sinon.stub();
      tm.getPlayerRemainingOpponents = sinon.stub().returns([]);
      tm.matchOrStorePlayer(p1);

      assert.deepEqual(tm.donePlayers, [p1]);
      assert.isFalse(tm.waitingPlayers.includes(p1));
      assert.isFalse(tm.startMatch.called);
    });
  });

  describe('getPlayerRemainingOpponents', function () {
    beforeEach(function () {
      tm = new TournamentManager([p1, p2, p3], 3);
    });

    describe('when none of the player\'s remaining opponents are bad players', function () {
      beforeEach(function () {
        tm.badPlayers = [p3];
        tm.matchTable.getRemainingOpponents = sinon.stub().returns([p2Id]);
      });

      it('returns all opponents from the match table', function () {
        assert.deepEqual(tm.getPlayerRemainingOpponents(p1), [p2]);
      });
    });

    describe('when some of the player\'s opponents are bad players', function () {
      beforeEach(function () {
        tm.badPlayers = [p3];
        tm.matchTable.getRemainingOpponents = sinon.stub().returns([p2Id, p3Id]);
      });

      it('filters the bad players from the opponent list', function () {
        assert.deepEqual(tm.getPlayerRemainingOpponents(p1), [p2]);
      });
    });
  });

  describe('isTournamentOver', function () {
    beforeEach(function () {
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

  describe('endTournament', function () {
    describe('calls the resolution function', function () {
      let tournamentResult, p1p2Match, p1p3Match, p2p3Match;
      beforeEach(function () {
        tm = new TournamentManager([p1, p2, p3], 3);
        p1p2Match = [new GameResult(p1Id, p2Id, WON)];
        p1p3Match = [new GameResult(p1Id, p3Id, BROKEN_RULE)];
        p2p3Match = [new GameResult(p2Id, p3Id, BROKEN_RULE)];
        tm.matchTable.setMatch(p1Id, p2Id, p1p2Match);
        tm.matchTable.setMatch(p1Id, p3Id, p1p3Match);
        tm.matchTable.setMatch(p2Id, p3Id, p2p3Match);
        tm.badPlayers = [p3];
        tm.donePlayers = [p1, p2];
        tm.resolveTournament = sinon.stub();
        tm.endTournament();
        tournamentResult = tm.resolveTournament.getCall(0).args[0];
      });
      it('with a TournamentResult with the correct MatchTable', function () {
        let matchTable = tournamentResult.matchTable;
        let games = matchTable.getAllGames();
        assert.deepEqual(games, p1p2Match.concat(p1p3Match).concat(p2p3Match));
      });
      it('with a TournamentResult with the correct list of bad players', function () {
        let badPlayers = tournamentResult.badPlayers;
        assert.deepEqual(badPlayers, [p3]);
      });
      it('with a TournamentResult with the correct list of all players', function () {
        let players = tournamentResult.players;
        assert.deepEqual(players, [p1, p2, p3]);
      });
    });
  });
});










