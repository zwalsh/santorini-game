const Referee = require('../../Admin/referee');
const Observer = require('../../Observer/observer');
const Player = require('../../Player/player');

let player1 = new Player();
let player2 = new Player();
let p1Id = 'Wayne';
let p2Id = 'Garth';

let referee = new Referee(player1, player2, p1Id, p2Id, 10);
let observer = new Observer();
referee.addObserver(observer);
referee.playGame();
