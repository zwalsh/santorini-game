let assert = require('chai').assert;
let Strategy = require('../Common/strategy');
let Worker = require('../Common/worker');
let Board = require('../Common/board');


describe('Strategy Test', function () {
  //DATA
  let strategy0 = new Strategy('alfred', 'sampson', 4, 0);
  let strategy1 = new Strategy('alfred', 'sampson', 4, 1);
  let listOfInitWorkers = [];
  let listOfInitWorkers2 = [{player: 'alfred', x: 0, y: 0}];
  let listOfInitWorkers3 = [{player: 'sampson', x: 0, y: 0}];
  let listOfInitWorkers4 = [{player: 'sampson', x: 0, y: 0}, {player: 'alfred', x: 5, y: 0},
                            {player: 'sampson', x: 2, y: 1}];
  let listOfInitWorkers5 = [{player: 'sampson', x: 0, y: 0}, {player: 'alfred', x: 5, y: 5},
                            {player: 'sampson', x: 2, y: 1}];

  describe('getNextWorkerPlace', function () {

    it('diagonal placement', function () {
      // Check X and Y
      assert.equal(strategy0.getNextWorkerPlace(listOfInitWorkers)[1], 0, 'First diagonal placement X');
      assert.equal(strategy0.getNextWorkerPlace(listOfInitWorkers)[2], 0, 'First diagonal placement Y');

      // Check X and Y
      assert.equal(strategy0.getNextWorkerPlace(listOfInitWorkers2)[1], 1, 'Second diagonal placement X');
      assert.equal(strategy0.getNextWorkerPlace(listOfInitWorkers2)[2], 1, 'Second diagonal placement Y');
    });

    it('distance placement', function () {
      // Check X and Y
      assert.equal(strategy1.getNextWorkerPlace(listOfInitWorkers)[1], 0, 'If no other workers, X = 0');
      assert.equal(strategy1.getNextWorkerPlace(listOfInitWorkers)[2], 0, 'If no other workers, Y = 0');

      // Check X and Y
      assert.equal(strategy1.getNextWorkerPlace(listOfInitWorkers3)[1], 5, 'Farthest X from occupied (0,0)');
      assert.equal(strategy1.getNextWorkerPlace(listOfInitWorkers3)[2], 5, 'First farthest Y from occupied (0,0)');

      // Check X and Y
      assert.equal(strategy1.getNextWorkerPlace(listOfInitWorkers4)[1], 5, 'Farthest X from occupied');
      assert.equal(strategy1.getNextWorkerPlace(listOfInitWorkers4)[2], 5, 'Farthest Y from occupied');

      // Check X and Y - my first worker is on expected farthest tile
      assert.equal(strategy1.getNextWorkerPlace(listOfInitWorkers5)[1], 4, 'Farthest X from occupied');
      assert.equal(strategy1.getNextWorkerPlace(listOfInitWorkers5)[2], 5, 'Farthest Y from occupied');
    });
  });

  describe('otherPlayer', function () {
    it ('check if returns the player other than the given in the strategy', function () {
      assert.equal(strategy0.otherPlayer('alfred'), 'sampson', 'Returns the other player than the given param');
      assert.equal(strategy0.otherPlayer('sampson'), 'alfred', 'Returns the other player than the given param');
    });
  });

  describe('isStillAlive', function () {

    let cleanBoard =
      [[0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0]];
    let w1 = new Worker(0, 0, 1, 'alfred');
    let w2 = new Worker(4, 1, 2, 'alfred');
    let w3 = new Worker(5, 1, 1, 'sampson');
    let w4 = new Worker(5, 5, 2, 'sampson');
    let listOfWorkers = [w1, w3, w2, w4];
    let board = new Board(null, cleanBoard, listOfWorkers);

    // Board where w1 is on tile where H=3
    let winningBoardLayoutTrue =
      [[3, 2, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0]];
    let winningBoardTrue = new Board(null, winningBoardLayoutTrue, listOfWorkers);

    // Both workers of one player are boxed in
    let boxInBoardLayoutTrue =
      [[0, 4, 0, 0, 0, 0],
        [4, 4, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 4, 4],
        [0, 0, 0, 0, 4, 0]];
    let w5 = new Worker(4, 0, 1, 'alfred');
    let w6 = new Worker(4, 1, 2, 'alfred');
    let w7 = new Worker(0, 0, 1, 'sampson');
    let w8 = new Worker(5, 5, 2, 'sampson');
    let listOfWorkers2 = [w5, w6, w7, w8];
    let boxInBoard = new Board(null, boxInBoardLayoutTrue, listOfWorkers2);

    let w9 = new Worker(0, 0, 1, 'alfred');
    let w10 = new Worker(5, 5, 2, 'alfred');
    let w11 = new Worker(4, 0, 1, 'sampson');
    let w12 = new Worker(4, 1, 2, 'sampson');
    let listOfWorkers3 = [w9, w10, w11, w12];
    let boxInBoardAlt = new Board(null, boxInBoardLayoutTrue, listOfWorkers3);

    let altWinnerBoard = new Board(null, winningBoardLayoutTrue, listOfWorkers2);

    it ('true if still alive', function () {
      assert.isTrue(strategy0.isStillAlive(board), 'Clean board with players scattered');
      assert.isTrue(strategy0.isStillAlive(winningBoardTrue), 'Player alive due to win');
      assert.isTrue(strategy0.isStillAlive(boxInBoard), 'Player alive due to other place loss');
    });

    it ('false if not alive or opponent wins', function () {
      assert.isFalse(strategy0.isStillAlive(boxInBoardAlt), 'Player not alive due to box in');
      assert.isFalse(strategy0.isStillAlive(altWinnerBoard), 'Player not alive due to opponent win');
    });
  });

  describe('decisionKeepsMeAlive', function () {
    let jsonBoard1Layout =
      [[0, 2, 1, 0, 4, 0],
      [4, 4, 0, 0, 4, 4],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0]];
    let w1 = new Worker(2, 0, 1, 'alfred');
    let w2 = new Worker(5, 0, 2, 'alfred');
    let w3 = new Worker(3, 1, 1, 'sampson');
    let w4 = new Worker(2, 1, 2, 'sampson');
    let json1WorkerList = [w1, w2, w3, w4];
    let jsonBoard1 = new Board(null, jsonBoard1Layout, json1WorkerList);
    let jsonTurn = [["move", 1, ["WEST", "PUT"]], ["build", ["EAST", "PUT"]]];

    let jsonBoard2Layout =
      [[0, 0, 4, 0, 0, 0],
        [4, 4, 4, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0]];
    let w5 = new Worker(0, 0, 1, 'alfred');
    let w6 = new Worker(3, 0, 2, 'alfred');
    let w7 = new Worker(5, 1, 1, 'sampson');
    let w8 = new Worker(4, 1, 2, 'sampson');
    let json2WorkerList = [w5, w6, w7, w8];
    let jsonBoard2 = new Board(null, jsonBoard2Layout, json2WorkerList);
    let jsonTurn2 = [["move", 1, ["EAST", "PUT"]], ["build", ["WEST", "PUT"]]];

    it('return if the decision and following decisions keep me alive', function () {
      assert.isFalse(strategy0.decisionKeepsAlive(jsonBoard1, 3, 'alfred', jsonTurn));
      assert.isTrue(strategy0.decisionKeepsAlive(jsonBoard2, 3, 'alfred', jsonTurn2));

    });
  });

  describe('genDecisions', function () {
    it ('gets the only available move decision', function () {
      let restrictedBoard =
        [[0, 0, 0, 0, 0, 0],
          [4, 4, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0]];
      let listOfWorkers = [new Worker(0, 0, 1, 'alfred')];
      let board = new Board(null, restrictedBoard, listOfWorkers);

      strategy0.genDecisions(board, 'alfred').forEach((d) => {
        let dir = d[0][2]
        assert.equal(dir[0], 'EAST');
        assert.equal(dir[1], 'PUT');
      });
    });

    it ('sees if the number of possible moves and builds is correct', function() {
      let cleanBoard =
        [[0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0]];
      let listOfWorkers = [new Worker(3, 3, 1, 'alfred')];
      let board = new Board(null, cleanBoard, listOfWorkers);

      let decs = strategy0.genDecisions(board, 'alfred');
      // The maximum possible decisions a worker can make is 64.
      assert.equal(decs.length, 64);
      // The maximum possible builds in one direction is 8.
      assert.equal(decs.filter((d) => d[0][2][0] === 'PUT' && d[0][2][1] === 'NORTH').length, 8);
    });
  });

  describe('applyDecision', function() {
    let cleanBoard =
      [[0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0]];
    let listOfWorkers = [new Worker(0, 0, 1, 'alfred')];
    let board = new Board(null, cleanBoard, listOfWorkers);

    it ('can operate on a move without a build', function() {
      let newBoard = strategy0.applyDecision(board, [["move", 1, ["EAST", "SOUTH"]]], 'alfred');

      assert.equal(newBoard.getWorkers()[0].posn.x, 1);
      assert.equal(newBoard.getWorkers()[0].posn.y, 1);

      newBoard.getBoard().forEach((r) => {
        r.forEach((c) => {
          assert.equal(c, 0);
        });
      });
    });

    it ('doesn\'t mutate the given board', function () {
      let newBoard = strategy0.applyDecision(board, [["move", 1, ["EAST", "PUT"]], ["build", ["WEST", "PUT"]]], 'alfred');

      // The worker is moved on the new board and remains on the old board.
      assert.equal(board.getWorkers()[0].posn.x, 0);
      assert.equal(newBoard.getWorkers()[0].posn.x, 1);

      // The worker builds on the new board, and the old board is unchanged.
      assert.equal(board.getBoard()[0][0], 0);
      assert.equal(newBoard.getBoard()[0][0], 1);
    });
  });

  describe('getNextTurn', function () {

    it ('picks a decision to move in a restricted scenario', function () {
      let strategyPoorPlanner = new Strategy('alfred', 'sampson', 1, 0);
      let restrictedBoard =
        [[0, 0, 0, 0, 0, 0],
          [4, 4, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0]];
      let listOfWorkers = [new Worker(0, 0, 1, 'alfred'), new Worker(0, 3, 1, 'sampson')];
      let board = new Board(null, restrictedBoard, listOfWorkers);

      let dec = strategyPoorPlanner.getNextTurn(board);

      assert.equal(dec[0][2][0], "EAST");
      assert.equal(dec[0][2][1], "PUT");
    });

    it ('picks a move if loss is inevitable', function () {
      let strategyLoser = new Strategy('alfred', 'sampson', 3, 0);

      let losingBoard =
        [[3, 2, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0]];
      let listOfWorkers = [new Worker(5, 5, 1, 'alfred'), new Worker(1, 0, 1, 'sampson')];
      let board = new Board(null, losingBoard, listOfWorkers);

      let dec = strategyLoser.getNextTurn(board);

      assert.equal(dec[0][0], 'move');
      assert.equal(strategyLoser.maxLookahead, 1);
    });
  });
});