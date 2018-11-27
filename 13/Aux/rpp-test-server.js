const net = require('net');
const PromiseJsonSocket = require('../../Santorini/Lib/promise-json-socket');
const GuardedPlayer = require('../../Santorini/Admin/guarded-player');
const RemoteProxyPlayer = require('../../Santorini/Remote/remote-proxy-player');
const Referee = require('../../Santorini/Admin/referee');

let players = [];
let playerNames = ['wayne', 'garth'];

const server = net.createServer({ "allowHalfOpen":true }, socket => {
  let pjsocket = new PromiseJsonSocket(socket);
  let id = playerNames[players.length];
  let rpp = new GuardedPlayer(new RemoteProxyPlayer(pjsocket, id), id, 10000);
  players.push(rpp);
  if (players.length === 2) {
    let ref = new Referee(players[0], players[1], 10000);
    players = [];
    ref.playGame().then(sthg => {
      console.log('game over success' + JSON.stringify(sthg));
      return;
    }).catch(err => {
      console.log('game over problem' + JSON.stringify(err));
      return;
    });
  }
});


server.listen(54321, '127.0.0.1');