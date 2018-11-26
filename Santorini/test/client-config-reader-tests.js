const chai = require('chai');
const assert = chai.assert;
const createClients = require('../Remote/client-config-reader').createClients;

function makeConfigObj(players, observers, ip, port) {
  return {
    "players"   : players,
    "observers" : observers,
    "ip"        : ip,
    "port"      : port
  };
}

describe('createClients tests', function () {
  let ip = '127.0.0.1', port = 50000;
  describe('given an invalid configuration', function () {

    describe('where a player specification is invalid', function () {
      it('returns false', function () {
        let players = [["borken", "itme", "./something/else"]];
        let observers = [];
        let configStr = JSON.stringify(makeConfigObj(players, observers, ip, port))
        assert.isFalse(createClients(configStr));
      });
    });

    describe('where there are no players specified', function () {
      it('returns false', function () {
        let players = [];
        let observers = [];
        let configStr = JSON.stringify(makeConfigObj(players, observers, ip, port))
        assert.isFalse(createClients(configStr));
      });
    });

    describe('that is missing a field', function () {
      it('returns false', function () {
        let players = [];
        let observers = [];
        let configObj = makeConfigObj(players, observers, ip, port);
        delete configObj.players;
        let configStr = JSON.stringify(configObj);
        assert.isFalse(createClients(configStr));
      });
    });

    describe('that has too many fields', function () {
      it('returns false', function () {
        let players = [];
        let observers = [];
        let configObj = makeConfigObj(players, observers, ip, port);
        configObj.suzanne = 'problem';
        let configStr = JSON.stringify(configObj);
        assert.isFalse(createClients(configStr));
      });
    });

    describe('that is not JSON', function () {
      it('returns false', function () {
        assert.isFalse(createClients("this is not json"));
      });
    });
  });
});





