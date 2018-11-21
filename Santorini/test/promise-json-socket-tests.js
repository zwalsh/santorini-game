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
    mockJsonSocket.write = sinon.stub();
    pjs.socket = mockJsonSocket;
  });
  describe('sendJson', function () {
    it('sends the value on the socket', function () {
      let sendValue = "this-string";
      pjs.sendJson(sendValue);
      assert.isTrue(mockJsonSocket.write.calledWith(JSON.stringify(sendValue)));
    });
  });
  describe('readJson', function () {
    let promisedJsonValue;
    describe('when a message has not been received before the call', function () {
      it('sets its resolve function as the callback', function () {
        expect(pjs.readJsonCallback).to.be.null;
        pjs.readJson();
        expect(pjs.readJsonCallback).to.not.be.null;
      });
    });
    describe('when messages are received before the call', function () {
      let firstJsonValue, secondJsonValue;
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
    describe('when the socket has been closed', function () {
      beforeEach(function () {
        pjs.socketOpen = false;
      });
      describe('when there are values in the queue', function () {
        let firstJsonValue;
        beforeEach(function () {
          firstJsonValue = 'first';
          pjs.receivedMessageQueue.push(firstJsonValue);
          promisedJsonValue = pjs.readJson();
        });
        it('returns the first message received', function () {
          return expect(promisedJsonValue).to.eventually.eql(firstJsonValue);
        });
        it('removes the first message from the queue', function () {
          return expect(pjs.receivedMessageQueue).to.deep.eql([]);
        });
      });
      describe('when there are no values in the queue', function () {
        beforeEach(function () {
          promisedJsonValue = pjs.readJson();
        });
        it('returns a Promise that rejects', function () {
          return assert.isRejected(promisedJsonValue);
        });
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
  describe('receiveData', function() {
    let bufferedData, inputData;
    beforeEach(function () {
      pjs.receiveJsonMessage = sinon.stub();
    });
    describe('when no data has been buffered', function () {
      describe('when given incomplete JSON data', function () {
        beforeEach(function () {
          inputData = '[1,';
          pjs.receiveData(inputData);
        });
        it('adds the input to the buffer', function () {
          assert.equal(pjs.bufferedInput, inputData);
        });
        it('does not process any JSON message', function () {
          assert.isFalse(pjs.receiveJsonMessage.called);
        });
      });
      describe('when given (multiple) complete JSON data', function () {
        beforeEach(function () {
          inputData = '[1] [3] [5]';
          pjs.receiveData(inputData);
        });
        it('processes all of the JSON messages separately', function () {
          assert.equal(pjs.receiveJsonMessage.callCount, 3);
          assert.deepEqual(pjs.receiveJsonMessage.getCall(0).args[0], [1]);
          assert.deepEqual(pjs.receiveJsonMessage.getCall(1).args[0], [3]);
          assert.deepEqual(pjs.receiveJsonMessage.getCall(2).args[0], [5]);
        });
        it('clears out the buffer', function () {
          assert.equal(pjs.bufferedInput, '');
        });
      });
    });
    describe('when some data is buffered', function () {
      beforeEach(function () {
        bufferedData = '[1, ';
        pjs.bufferedInput = bufferedData;
      });
      describe('when given data that completes the JSON value in the buffer', function () {
        beforeEach(function () {
          inputData = '2]';
          pjs.receiveData(inputData);
        });
        it('processes the JSON message', function () {
          assert.isTrue(pjs.receiveJsonMessage.calledOnce);
          assert.deepEqual(pjs.receiveJsonMessage.getCall(0).args[0], [1, 2]);
        });
        it('clears out the buffer', function () {
          assert.equal(pjs.bufferedInput, '');
        });
      });
      describe('when given data that does not complete the JSON value', function () {
        beforeEach(function () {
          inputData = '2,';
          pjs.receiveData(inputData);
        });
        it('adds the input to the buffer', function () {
          assert.equal(pjs.bufferedInput, bufferedData + inputData);
        });
        it('does not process any JSON message', function () {
          assert.isFalse(pjs.receiveJsonMessage.called);
        });
      });
    });
    describe('when given non-JSON input', function () {
      beforeEach(function () {
        pjs.bufferedInput = '["some data",';
        pjs.receiveData('not json');
      });
      it('sets the socketOpen flag to false', function () {
        assert.isFalse(pjs.socketOpen);
      });
      it('does not call receiveJsonMessage', function () {
        assert.isFalse(pjs.receiveJsonMessage.called);
      });
      it('clears out the buffer', function () {
        assert.equal(pjs.bufferedInput, "");
      });
    });
    describe('when the socketOpen flag is false', function () {
      let inputData;
      beforeEach(function () {
        inputData = '[1, 2]';
        pjs.socketOpen = false;
        pjs.receiveData(inputData);
      });
      it('does not call receiveJsonMessage', function () {
        assert.isFalse(pjs.receiveJsonMessage.called);
      });
      it('does not add the received data to the buffer', function () {
        assert.equal(pjs.bufferedInput, "");
      });
    });
  });
});
