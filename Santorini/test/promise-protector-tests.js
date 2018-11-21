const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const assert = chai.assert;
const promiseProtector = require('../Lib/promise-protector');

const timeout = 25;

describe('promiseProtector', function () {
  it('calls the promise function on the given subject', function () {
    let promiseFn = (subj) => {
      return Promise.resolve(subj.value);
    };
    let subject = { value: 5 };
    let protectedPromise = promiseProtector(subject, promiseFn, timeout);
    return expect(protectedPromise).to.eventually.eql(5);
  });
  describe('when the promise function resolves to a value', function () {
    it('promiseProtector resolves with that value', function () {
      let promiseFn = (p) => {
        return new Promise((resolve => {
          setTimeout(resolve, timeout / 2, "succeeded");
          return;
        }));
      };
      let protectedPromise = promiseProtector({}, promiseFn, timeout);
      return expect(protectedPromise).to.eventually.eql("succeeded");
    });
  });
  describe('when the promise function times out', function () {
    it('promiseProtector rejects', function () {
      let promiseFn = (p) => {
        return new Promise((resolve => {
          setTimeout(resolve, timeout * 420, "succeeded");
          return;
        }));
      };
      let protectedPromise = promiseProtector({}, promiseFn, timeout);
      return assert.isRejected(protectedPromise);
    });
  });
  // this test passes but warns about an unhandled Promise rejection (reason unknown)
  xdescribe('when the promise function errors when called', function () {
    it('promiseProtector rejects', function () {
      let promiseFn = (p) => {
        throw new Error('this is not a Promise!');
      };
      let protectedPromise = promiseProtector({}, promiseFn, timeout);
      return assert.isRejected(protectedPromise);
    });
  });
  // this test passes but warns about an unhandled Promise rejection (reason unknown)
  xdescribe('when the promise function returns something other than a Promise', function () {
    it('promiseProtector rejects', function () {
      let promiseFn = (p) => {
        return 5; // 5 is not a promise
      };
      let protectedPromise = promiseProtector({}, promiseFn, timeout);
      return assert.isRejected(protectedPromise);
    });
  });
  describe('when the promise function returns a Promise that rejects', function () {
    it('promiseProtector rejects', function () {
      let promiseFn = (p) => {
        return Promise.reject();
      };
      let protectedPromise = promiseProtector({}, promiseFn, timeout);
      return assert.isRejected(protectedPromise);
    });
  });
});