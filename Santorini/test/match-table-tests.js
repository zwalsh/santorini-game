const chai = require('chai');
const assert = chai.assert;
const MatchTable = require('../Admin/match-table');
const constants = require('../Common/constants');
const GameResult = require('../Common/game-result');

const BROKEN_RULE = constants.EndGameReason.BROKEN_RULE;
const WON = constants.EndGameReason.WON;

describe('MatchTable', function () {
  let matchTable, p1, p2, p3;
  beforeEach(function () {
    p1 = 'salt';
    p2 = 'tequila';
    p3 = 'lime';
    matchTable = new MatchTable([p1, p2, p3]);
  });

  describe('getMatch', function () {
    let matchP1P2;
    beforeEach(function () {
      matchP1P2 = [new GameResult(p1, p2, WON)];
      matchTable.setMatch(p1, p2, matchP1P2);
    });

    it('returns false when the players have not played', function () {
      assert.isFalse(matchTable.getMatch(p1, p3));
    });
    it('returns the match when they have played', function () {
      assert.deepEqual(matchTable.getMatch(p1, p2), matchP1P2);
    });
    it('returns the same match when the player order is reversed', function () {
      assert.deepEqual(matchTable.getMatch(p2, p1), matchP1P2);
    });
  });

  describe('setMatch', function () {
    it('sets the match properly between the two opponents', function () {
      let match = [new GameResult(p3, p1, WON)];
      matchTable.setMatch(p1, p3, match);
      assert.deepEqual(matchTable.getMatch(p1, p3), match);
    });
    it('updates past matches when a player cheated', function () {
      let oldMatch = [new GameResult(p3, p1, WON), new GameResult(p3, p1, WON)];
      matchTable.setMatch(p1, p3, oldMatch);
      let p3CheatMatch = [new GameResult(p3, p2, WON), new GameResult(p2, p3, BROKEN_RULE)];
      matchTable.setMatch(p2, p3, p3CheatMatch);

      let oldMatchUpdated = [new GameResult(p1, p3, BROKEN_RULE), new GameResult(p1, p3, BROKEN_RULE)];
      let cheatMatchUpdated = [new GameResult(p2, p3, BROKEN_RULE), new GameResult(p2, p3, BROKEN_RULE)];
      assert.deepEqual(matchTable.getMatch(p1, p3), oldMatchUpdated);
      assert.deepEqual(matchTable.getMatch(p2, p3), cheatMatchUpdated);
    });
    it('sets past matches to the empty array when both players cheat', function () {
      let matchP1P2 = [new GameResult(p2, p1, WON)];
      matchTable.setMatch(p1, p2, matchP1P2);
      let p1CheatP3 = [new GameResult(p3, p1, BROKEN_RULE)];
      matchTable.setMatch(p1, p3, p1CheatP3);
      // after p1 cheats, p2 has won by virtue of a broken rule
      assert.deepEqual(matchTable.getMatch(p1, p2), [new GameResult(p2, p1, BROKEN_RULE)]);

      let p2CheatP3 = [new GameResult(p3, p2, BROKEN_RULE)];
      matchTable.setMatch(p2, p3, p2CheatP3);
      // after p2 cheats, the p1-p2 match is struck from the record
      let removedMatch = [];
      assert.deepEqual(matchTable.getMatch(p1, p2), removedMatch);
    });
  });

  describe('getRemainingOpponents', function () {
    it('returns all opponents when the player has played no matches', function () {
      assert.deepEqual(matchTable.getRemainingOpponents(p1), [p2, p3]);
    });
    it('returns only opponents that the player has not yet played', function () {
      let matchP1P2 = [new GameResult(p2, p1, WON)];
      matchTable.setMatch(p1, p2, matchP1P2);
      assert.deepEqual(matchTable.getRemainingOpponents(p1), [p3]);
    });
    it('returns an empty list when the player has played everyone', function () {
      let matchP1P2 = [new GameResult(p2, p1, WON)];
      matchTable.setMatch(p1, p2, matchP1P2);
      let matchP1P3 = [new GameResult(p1, p3, WON)];
      matchTable.setMatch(p1, p3, matchP1P3);
      assert.deepEqual(matchTable.getRemainingOpponents(p1), []);
    });
  });

  describe('getAllGames', function () {
    it('returns an empty list when no games have been played', function () {
      let noGameResults = [];
      assert.deepEqual(matchTable.getAllGames(), noGameResults);
    });
    it('returns a flat list of all GameResults so far, in the match table\'s order', function () {
      let matchP1P2 = [new GameResult(p1, p2, WON), new GameResult(p2, p1, WON), new GameResult(p1, p2, WON)];
      let matchP2P3 = [new GameResult(p2, p3, WON), new GameResult(p2, p3, WON)];

      matchTable.setMatch(p2, p3, matchP2P3);
      matchTable.setMatch(p1, p2, matchP1P2);
      assert.deepEqual(matchTable.getAllGames(), matchP1P2.concat(matchP2P3));
    });
    it('does not return anything for matches that have been removed due to both cheating', function () {
      let matchP1P2 = [new GameResult(p2, p1, WON)];
      matchTable.setMatch(p1, p2, matchP1P2);
      let p1CheatP3 = [new GameResult(p3, p1, BROKEN_RULE)];
      matchTable.setMatch(p1, p3, p1CheatP3);
      let p2CheatP3 = [new GameResult(p3, p2, BROKEN_RULE)];
      matchTable.setMatch(p2, p3, p2CheatP3);

      // only the games that p3 played in should remain
      assert.deepEqual(matchTable.getAllGames(), [new GameResult(p3, p1, BROKEN_RULE), new GameResult(p3, p2, BROKEN_RULE)]);
    });
    it('returns all GameResults in the proper order when all Matches have been played', function () {
      let matchP1P2 = [new GameResult(p1, p2, WON), new GameResult(p2, p1, WON), new GameResult(p1, p2, WON)];
      let matchP2P3 = [new GameResult(p2, p3, WON), new GameResult(p2, p3, WON)];
      let matchP1P3 = [new GameResult(p3, p1, WON), new GameResult(p3, p1, WON)];

      matchTable.setMatch(p2, p3, matchP2P3);
      matchTable.setMatch(p1, p2, matchP1P2);
      matchTable.setMatch(p1, p3, matchP1P3);
      assert.deepEqual(matchTable.getAllGames(), matchP1P2.concat(matchP1P3).concat(matchP2P3));
    });
  });
});