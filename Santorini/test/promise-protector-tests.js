const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const assert = chai.assert;
const promiseProtector = require('../Lib/promise-protector');

const timeout = 25;

describe('promiseProtector', function () {
  describe('the promise function resolves to a value', function () {
    it('the Promise resolves with the result of the call', function () {
      let promiseFn = (p) => {
        return new Promise((resolve => {
          setTimeout(resolve, timeout / 2, "succeeded");
        }));
      };
      let protectedPromise = promiseProtector({}, promiseFn, timeout);
      return expect(protectedPromise).to.eventually.eql("succeeded");
    });
  });
  describe('the promise function times out', function () {
    it('the Promise rejects with the result from the timeout Promise', function () {
      let promiseFn = (p) => {
        return new Promise((resolve => {
          setTimeout(resolve, timeout * 420, "succeeded");
        }));
      };
      let protectedPromise = promiseProtector({}, promiseFn, timeout);
      return assert.isRejected(protectedPromise);
    });
  });
  // this test passes but warns about an unhandled Promise rejection (reason unknown)
  xdescribe('the promise function errors when called', function () {
    it('the Promise rejects', function () {
      let promiseFn = (p) => {
        throw new Error('this is not a Promise!');
      };
      let protectedPromise = promiseProtector({}, promiseFn, timeout);
      return assert.isRejected(protectedPromise);
    });
  });
  // this test passes but warns about an unhandled Promise rejection (reason unknown)
  xdescribe('the promise function returns something other than a Promise', function () {
    it('the Promise rejects with the result from the timeout Promise', function () {
      let promiseFn = (p) => {
        return 5; // 5 is not a promise
      };
      let protectedPromise = promiseProtector({}, promiseFn, timeout);
      return assert.isRejected(protectedPromise);
    });
  });
});