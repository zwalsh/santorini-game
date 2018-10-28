

// /* Player -> Promise<GameResult>
//
//  */
// // this is like kind of like parallel to like our while loop
// function getGameResult(currPlayer) {
//   return getAndApplyTurn(player).then((gameState) => {
//     if (gameState.isOver) {
//       return Promise.resolve(gameState);
//     } else {
//       return getGameResult(otherPlayer, board)
//     }
//   });
// }
//
//
// function getAndApplyTurn(player) {
//   return player.takeTurn(board).then((turn) => {
//     if turn.checkIt {
//       board.apply(turn);
//       return Promise.resolve(inProgress);
//     } else {
//       return Promise.resolve(gameOverHahaha);
//     }
//   });
// }

/* Number -> Promise<String>

 */
// this is like kind of like parallel to like our while loop
function getGameResult(currNumber) {
  return getAndApplyTurn(currNumber).then((gameState) => {
    if (gameState === 'DONE') {
      return Promise.resolve(gameState);
    } else {
      return getGameResult(gameState);
    }
  });
}

/* Number -> Promise<Number> | Promise<String>

 */
function getAndApplyTurn(numberIn) {
  return takeTurn(numberIn).then((nextNum) => {
    if (nextNum !== 0) {
      // board.apply(turn);
      return Promise.resolve(nextNum);
    } else {
      return Promise.resolve("DONE");
    }
  });
}

/* Number -> Promise<Number>

 */
function takeTurn(curNumber) {
  console.log('decrementing to ' + (curNumber - 1));
  return Promise.resolve(curNumber - 1);
}


getGameResult(10).then((output) => { console.log(output); });