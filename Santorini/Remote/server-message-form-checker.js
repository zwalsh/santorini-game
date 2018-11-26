/*
  This module checks the well-formedness of JSON values sent
  as messages from client to server in a networked Santorini
  tournament setting.

  It provides functions for checking the following data definitions:
    - Place
    - Action

  Place        is a JSON array: [Coordinate, Coordinate]

  Action       is one of:
               - String, which represents the name of a player that is giving up;
               - [Worker,EastWest,NorthSouth], which represents a winning move; or
               - [Worker,EastWest,NorthSouth,EastWest,NorthSouth], which represents
                  a request to move the specified worker and build in the specified
                  directions. The first pair of directions specify the move, the
                  second one the building step.

  Worker       is a String of the player's name followed by either
               a 1 or a 2, denoting which of the player's Workers it is.

 */

/*

 */
function checkPlace(place) {}

function checkAction(action) {}

function checkWorker(worker) {}

module.exports = {
  'checkPlace': checkPlace,
  'checkAction': checkAction,
  'checkWorker': checkWorker,
};







