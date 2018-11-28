/*
  A MatchTable is a data structure that records all interactions between players in a
  tournament of Santorini. It provides the following functionality:
  - getting and setting a particular match between players
  - getting the remaining opponents of a player
  - getting all matches a player has been a part of
  - getting all matches in the tournament

  ================ Data Definitions ================
  GameResult is defined in referee.js

  A Match is one of:
  - [GameResult, ..., GameResult] - a non-empty list of GameResults indicating a match
                                    between two players that has completed, where no
                                    more than one player cheated.
  - []                            - an empty list, indicating a Match struck from the
                                    record, as both players cheated.
*/
const GameResult = require('../Common/game-result');
const constants = require('../Common/constants');

class MatchTable {

  /* [String, ...] -> MatchTable
     Takes a list of at least length two of player names, where each player name
     in the list is unique, and makes a MatchTable.
  */
  constructor(players) {
    let playerIdxMap = new Map();
    for (let idx = 0; idx < players.length; idx++) {
      playerIdxMap.set(players[idx], idx);
    }

    this.playerIdxMap = playerIdxMap;
    this.players = players;
    this.matches = [];
    for (let rowIdx = 0; rowIdx < players.length; rowIdx++) {
      let row = [];
      for (let colIdx = 0; colIdx < rowIdx; colIdx++) {
        // Interaction between players hasn't happened yet
        row.push(false);
      }
      this.matches.push(row);
    }
  }

  /* String String -> [Maybe Match]
    Returns the Match between the two players, or false if it has not occurred.
  */
  getMatch(player1, player2) {
    let p1Idx = this.playerIdxMap.get(player1);
    let p2Idx = this.playerIdxMap.get(player2);
    if (p1Idx < p2Idx) {
      return this.matches[p2Idx][p1Idx];
    } else {
      return this.matches[p1Idx][p2Idx];
    }
  }

  /* String String Match -> Void
    Sets the Match that has occurred between the two players.

    If rule-breaking occurred during the Match, then this method updates all
    games involving the rule-breaker (including games in the given match) and
    awards those games to the opponent.

    If both players in a Match are determined to be rule-breakers, then that match
    is set to be the empty array.
  */
  setMatch(player1, player2, match) {
    this.setMatchInternal(player1, player2, match);

    this.ruleBreakersInMatch(player1, player2).forEach((name) => {
      this.awardMatchesToOpponent(name);
    });
  }

  /* String -> [String, ...]
    Returns the names of all opponents against whom the given player has not
    yet played.
  */
  getRemainingOpponents(player) {
    return this.players.reduce((opponentList, opponent) => {
      let match = this.getMatch(player, opponent);
      if (!match && opponent !== player) {
        return opponentList.concat(opponent);
      } else {
        return opponentList;
      }
    }, []);
  }

  /* Void -> [GameResult, ...]
    Returns a list of all GameResults that have occurred in the tournament.
    Sorted in order of the players as given to this MatchTable in the
    constructor.
  */
  getAllGames() {
    return this.getAllMatches().reduce((acc, val) => acc.concat(val), []);
  }

  /* Void -> [Match, ...]
    Output a list of all Matches that have occurred and not been struck from the record.
  */
  getAllMatches() {
     let matches = [];
     for (let player of this.players) {
       let curPlayerIdx = this.playerIdxMap.get(player);
       let opponents = this.players.slice(curPlayerIdx + 1);
       for (let opponent of opponents) {
         let match = this.getMatch(player, opponent);
         if (match && match.length !== 0) {
           matches.push(match);
         }
       }
     }
     return matches;
  }

  /* Void -> [GameResult, ...]
    Returns a list of GameResults, one per Match, that indicates the overall winner of
    that series of games.
  */
  getAllMatchResults() {
    return this.getAllMatches().map((m) => this.matchResult(m));
  }

  /* Match -> [Maybe GameResult]
    Produces a single GameResult that represents the result of the match
    between the two players. The winner of the GameResult is the one
    that won the most games, and the reason indicates whether the loser
    cheated.
  */
  matchResult(gameResults) {
    if (gameResults.length === 0) {
      return false;
    }

    let gr0 = gameResults[0];
    let p1 = gr0.winner;
    let p2 = gr0.loser;
    let p1WinCount = 0;

    for (let gr of gameResults) {
      if (gr.reason === constants.EndGameReason.BROKEN_RULE) {
        return gr.copy();
      }
      if (gr.winner === p1) {
        p1WinCount++;
      }
    }
    if (p1WinCount > gameResults.length / 2) {
      return new GameResult(p1, p2, constants.EndGameReason.WON);
    } else {
      return new GameResult(p2, p1, constants.EndGameReason.WON);
    }
  }

  // ========== Internal Helpers ==============

  /* String String Match -> Void
    Sets the Match that has occurred between the two players.
    Stores the data on the correct side of the triangular 2d array.
  */
  setMatchInternal(player1, player2, match) {
    let p1Idx = this.playerIdxMap.get(player1);
    let p2Idx = this.playerIdxMap.get(player2);
    if (p1Idx < p2Idx) {
      this.matches[p2Idx][p1Idx] = match;
    } else {
      this.matches[p1Idx][p2Idx] = match;
    }
  }

  /* String String -> [String, ...]
  Return the names of any players who broke a rule in the match between them.
  */
  ruleBreakersInMatch(player1, player2) {
    let match = this.getMatch(player1, player2);
    if (match) {
      if (match.length === 0) {
        return [player1, player2];
      }
      let lastGame = match[match.length - 1];
      if (lastGame.reason === constants.EndGameReason.BROKEN_RULE) {
        return [lastGame.loser];
      } else {
        return [];
      }
    }
    return [];
  }

  /* String -> Void
    For each match the given player played in, award all games to the opponent.
    If the opponent already lost by breaking a rule, remove the game results.
  */
  awardMatchesToOpponent(ruleBreaker) {
    for (let opponent of this.players) {
      let match = this.getMatch(ruleBreaker, opponent);
      if (match && match.length > 0) {
        let updatedMatch = this.awardMatchToOpponent(ruleBreaker, opponent, match);
        this.setMatchInternal(ruleBreaker, opponent, updatedMatch);
      }
    }
  }

  /* String String Match -> Match
    Given two players and the non-empty match played between them,
    if both players in the match have now cheated, return a new match with no games.
    Otherwise, return a new match where the second player won all games
    due to the first player breaking a rule.
  */
  awardMatchToOpponent(ruleBreaker, opponent, match) {
    let lastGame = match[match.length - 1];
    if (lastGame.loser === opponent && lastGame.reason === constants.EndGameReason.BROKEN_RULE) {
      return [];
    } else {
      let gameResult = new GameResult(opponent, ruleBreaker, constants.EndGameReason.BROKEN_RULE);
      let updatedMatch = [];
      match.forEach(() => { updatedMatch.push(gameResult.copy()) });
      return updatedMatch;
    }
  }
}

module.exports = MatchTable;