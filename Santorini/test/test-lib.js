const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;

/* String, ... -> Object
  Mocks an object by taking in a variable number of method names to mock,
  and adding a sinon stub as each of the given methods.
 */
function createMockObject() {
  let object = {};
  for (let method of arguments) {
    object[method] = sinon.stub();
  }
  return object;
}

/* [X, ...] [X, ...] -> Void
  Assert that the lists are deep copies of each other
  i.e. each pair of elements are deeply equal but not strictly equal (!==)
*/
function assertDeepCopy(arr1, arr2) {
  assert.equal(arr1.length, arr2.length);
  for (let i = 0; i < arr1.length; i++) {
    assert.deepEqual(arr1[i], arr2[i]);
    assert.notStrictEqual(arr1[i], arr2[i]);
  }
}

/* String -> Player
  Create mock Player object with getId() and setId() mocked.
  getId() returns name. No other Player methods mocked.
*/
function mockPlayer(name) {
  let player = createMockObject('getId', 'setId');
  player.getId.returns(name);
  return player;
}

module.exports = {
  'createMockObject': createMockObject,
  'assertDeepCopy': assertDeepCopy,
  'mockPlayer': mockPlayer,
};
