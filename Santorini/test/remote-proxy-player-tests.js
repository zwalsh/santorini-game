const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const sinon = require('sinon');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const testLib = require('./test-lib');

const RemoteProxyPlayer = require('../Remote/remote-proxy-player');

describe('RemoteProxyPlayer tests', function () {
  let rpp, mockPJSocket, name;
  beforeEach(function () {
    name = 'butt';
    mockPJSocket = testLib.createMockObject('readJson', 'sendJson');
    rpp = new RemoteProxyPlayer(mockPJSocket, name);
  });
  
  /*
    Mock the socket to return the correct JSON when given
    the expected input, and that
    the RPP returns the correct result.
   */
  
  describe('setId', function () {
    beforeEach(function () {

    });
    it('changes the name on the RPP');
    it('sends the new name to the client');
    it('resolves to indicate that the name was sent');
  });
  
  describe('placeInitialWorker', function () {
    beforeEach(function () {

    });
    it('sends the correct Placement to the client');
    it('asks the client for a response');
    it('converts the response to a PlaceRequest and returns it');
  });

  describe('takeTurn', function () {
    beforeEach(function () {

    });
    it('sends the correct Board to the client');
    it('asks the client for a response');
    it('converts the response to a Turn and returns it');
  });

  describe('newGame', function () {
    beforeEach(function () {

    });
    it('sends the opponent\'s name to the client');
    it('resolves to indicate that the name was sent');
  });

  describe('notifyTournamentOver', function () {
    beforeEach(function () {

    });
    it('sends the correct list of EncounterOutcomes to the client');
    it('resolves to indicate that the results were sent');
  });
});

