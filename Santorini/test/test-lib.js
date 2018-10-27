const sinon = require('sinon');

/* String, ... -> Object
  Mocks an object by taking in a variable number of method names to mock,
  and adding a sinon stub as each of the given methods.
 */
module.exports.createMockObject = function createMockObject() {
  let object = {};
  for (let method of arguments) {
    object[method] = sinon.stub();
  }
  return object;
}