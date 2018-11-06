const chai = require('chai');
const expect = chai.expect;

const configureTournament = require('../Admin/configure-tournament').configureTournament;
const testLib = require('./test-lib');

describe('ConfigureTournament', function () {
  describe('when the input contains a regular player', function () {
    it('tries to load a normal Player', function () {

    });
  });
  describe('when it is asked for the same component twice', function () {
    it('does not try to load that component twice', function () {

    });
  });
  describe('when the loaded component fails', function () {
    it('does not include the player in the Tournament', function () {

    });
  });
});