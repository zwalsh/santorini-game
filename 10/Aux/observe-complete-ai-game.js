const Referee = require('../../Santorini/Admin/referee');
const Observer = require('../../Santorini/Observer/observer');
const Player = require('../../Santorini/Player/player');
const GuardedPlayer = require('../../Santorini/Admin/guarded-player');

let timeout = 10;
let p1Id = 'Wayne';
let p2Id = 'Garth';

let player1 = new GuardedPlayer(new Player(p1Id), p1Id, timeout);
let player2 = new GuardedPlayer(new Player(p2Id), p2Id, timeout);

let referee = new Referee(player1, player2);
let observer = new Observer();
referee.addObserver(observer);
referee.playGame();
