const chai = require('chai');
const sinon = require('sinon');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const assert = chai.assert;
const PromiseJsonSocket = require('../Lib/promise-json-socket');
const testLib = require('./test-lib');

describe('PromiseJsonSocket', function () {
  let pjs, mockJsonSocket;
  beforeEach(function () {
    pjs = new PromiseJsonSocket();
    mockJsonSocket = testLib.createMockObject();
    mockJsonSocket.sendMessage = sinon.stub();
    pjs.socket = mockJsonSocket;
  });
  describe('sendJson', function () {
    it('sends the value on the socket', function () {
      let sendValue = "this-string";
      pjs.sendJson(sendValue);
      assert.isTrue(mockJsonSocket.sendMessage.calledWith(sendValue));
    });
  });
  describe('readJson', function () {
    describe('when a message has not been received before the call', function () {
      it('sets its resolve function as the callback', function () {
        expect(pjs.readJsonCallback).to.be.null;
        pjs.readJson();
        expect(pjs.readJsonCallback).to.not.be.null;
      });
    });
    describe('when messages are received before the call', function () {
      let promisedJsonValue, firstJsonValue, secondJsonValue;
      beforeEach(function () {
        firstJsonValue = 'first';
        secondJsonValue = 'second';
        pjs.receivedMessageQueue.push(firstJsonValue);
        pjs.receivedMessageQueue.push(secondJsonValue);

        promisedJsonValue = pjs.readJson();
      });
      it('returns the first message received', function () {
        return expect(promisedJsonValue).to.eventually.eql(firstJsonValue);
      });
      it('removes the first message from the queue', function () {
        return expect(pjs.receivedMessageQueue).to.deep.eql([secondJsonValue]);
      });
    });
  });
  describe('receiveJsonMessage', function () {
    describe('when there is no caller waiting', function () {
      it('stores the received value on the queue', function () {
        let message = 'xyz';
        pjs.receiveJsonMessage(message);
        return expect(pjs.receivedMessageQueue).to.deep.eql([message]);
      });
    });
    describe('when there is a caller waiting', function () {
      let resolveFnMock;
      beforeEach(function () {
        resolveFnMock = sinon.stub();
        pjs.readJsonCallback = resolveFnMock;
      });
      it('resolves their call with the value', function () {
        let message = 'xyz';
        pjs.receiveJsonMessage(message);
        expect(pjs.receivedMessageQueue).to.deep.eql([]);
        expect(resolveFnMock.calledWith(message)).to.be.true;
      });
    });
  });
});
