const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const TournamentServer = require('../Remote/server');

let createServer = require('../Remote/server-config-reader').createServer;

function makeConfigObj(minPlayers, port, waitingFor, repeat) {
  return {
    "min players" : minPlayers,
    "port"        : port,
    "waiting for" : waitingFor,
    "repeat"      : repeat
  };
}

describe('ServerConfigReader tests', function () {
  describe('createServer', function () {
    describe('when given an invalid configuration string', function () {
      describe('that is not JSON', function () {
        it('returns false', function () {
          let configStr = '[not, json';
          let result = createServer(configStr);
          assert.isFalse(result);
        });
      });

      describe('that is an object with too many keys', function () {
        let configStr;
        beforeEach(function () {
          let configObj = makeConfigObj(2, 50000, 10, 1);
          configObj.bad = "bad";
          configStr = JSON.stringify(configObj);
        });
        it('returns false', function () {
          let result = createServer(configStr);
          assert.isFalse(result);
        });
      });

      describe('that is missing a required key', function () {
        let configStr;
        beforeEach(function () {
          let configObj = makeConfigObj(2, 50000, 10, 1);
          delete configObj.repeat;
          configStr = JSON.stringify(configObj);
        });
        it('returns false', function () {
          let result = createServer(configStr);
          assert.isFalse(result);
        });
      });

      describe('where the values do not match the specification', function () {
        describe('min players', function () {
          let configStr;
          beforeEach(function () {
            let configObj = makeConfigObj({}, 50000, 10, 1);
            configStr = JSON.stringify(configObj);
          });
          it('returns false', function () {
            let result = createServer(configStr);
            assert.isFalse(result);
          });
        });

        describe('port', function () {
          let configStr;
          beforeEach(function () {
            let configObj = makeConfigObj(2, 420, 10, 1);
            configStr = JSON.stringify(configObj);
          });
          it('returns false', function () {
            let result = createServer(configStr);
            assert.isFalse(result);
          });
        });

        describe('waiting for', function () {
          let configStr;
          beforeEach(function () {
            let configObj = makeConfigObj(2, 50000, -1, 1);
            configStr = JSON.stringify(configObj);
          });
          it('returns false', function () {
            let result = createServer(configStr);
            assert.isFalse(result);
          });
        });

        describe('repeat', function () {
          let configStr;
          beforeEach(function () {
            let configObj = makeConfigObj(2, 50000, 10, 'hello');
            configStr = JSON.stringify(configObj);
          });
          it('returns false', function () {
            let result = createServer(configStr);
            assert.isFalse(result);
          });
        });
      });
    });

    describe('when given a valid configuration string', function () {
      let configStr;
      beforeEach(function () {
        configStr = JSON.stringify(makeConfigObj(2, 50000, 1, 1));
      });
      it('returns a TournamentServer', function () {
        let server = createServer(configStr);
        assert.isTrue(server instanceof TournamentServer);
        assert.equal(server.minPlayers, 2);
        assert.equal(server.port, 50000);
        assert.equal(server.waitingFor, 1000);
        assert.equal(server.repeat, true);
      });
    });
  });
});