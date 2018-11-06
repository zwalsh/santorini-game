To play a Santorini game, a client will follow this protocol, where an open socket is assumed.
This phase is repeated during the tournament, initiated each time by the server, until the
tournament is over.

The following data definitions are used below:

* An InitWorker is a: {player: string, x: int, y: int}
* A Board is [[Cell, ...], ...].
  
* A Cell is one of: a Height or a BuildingWorker Worker.
  
* A Height is one of: 0, 1, 2, 3, 4. It indicates (the height of) a building.
  
* A BuildingWorker is a String that starts with a single digit
  followed by a Worker. The first digit represents the Height of the building.
  
* A Worker is a string of lowercase letters that ends in either 1 or 2.
   The last digit indicates whether it is the first or the second worker
   of a player. The lowercase letters are the name of the player that
   owns the worker.
  
* An incomplete row of a Board is filled with trailing, unoccupied Cells.

* A WorkerRequest is a: {player: string, id: int}
  * The player is the name of the player making the request on the worker with
  the given id.

* A Direction is [EastWest, NorthSouth], and represents a direction from a cell,
  * where EastWest is one of:
  "EAST" "PUT" "WEST", with "PUT" meaning no horizontal movement
  * and NorthSouth is one of:
  "NORTH" "PUT" "SOUTH", with "PUT" meaning no vertical movement

* A MoveRequest is a: ["move", WorkerRequest, Direction], and represents the action of moving 
the specified worker in the direction.
   
* A BuildRequest is a: ["build", Direction], and represents the action of building with
 the specified worker in the direction.
   
* A Turn is a [MoveRequest(, BuildRequest)], and represents a complete turn taken
by a player, where the build is optional, indicating that the move is intended
to win the game.

* An EndGameReason represents why a game ended and is one of:
  * "WON": the winner won cleanly by boxing in an opponent or moving to a winning height
  * "BROKEN_RULE": the winner won because the loser broke a rule, timed out, etc.

* A GameResult is a: {winner: string, loser: string, reason: EndGameReason}
  * where the winner string is the name of the winner
  * the loser string is the name of the loser
        
                         Client                                              Server
                            |                                                  |                         
                            |                 <---------- ["new_game",         | A new game is starting  
                            |                              opp_id]             | against the given   
                            |                                                  | opponent
        acknowledge the     |            "OK" ---------->                      |                                              
        start of the game   |                                                  |                           
        -----------------------------------------------------------------------------------------------  
        SETUP: repeats      |                                                  |                         
          until 4 workers   |                                                  |                          
          placed (or a rule |                                                  |                         
          is broken)        |                                                  |                         
                            |                                                  |                              
                            |                 <---------- ["place",            | Asks the player     
                            |                               [InitWorker, ...]] | to place a
                            |                                                  | worker, given the       
                            |                                                  | currently placed        
                            |                                                  | workers                                  
        A request to place  | ["place", x, y] ---------->                      |                         
        a worker at the     |                                                  |                         
        given x, y          |                                                  |                         
        -----------------------------------------------------------------------------------------------  
        PLAY: repeats       |                                                  |                         
         until the game is  |                                                  |                         
         over               |                                                  |                         
                            |                 <---------- ["turn", Board]      | Asks the player         
                            |                                                  | to take a turn,      
                            |                                                  | given the Board. 
          Player sends back |           Turn  ---------->                      |                         
           a valid Turn     |                                                  |                         
                            |                                                  |                         
        -----------------------------------------------------------------------------------------------    
        OVER: This phase    |                                                  |                         
         occurs once, when  |                                                  |                         
         the game is over   |                                                  |                         
                            |                <----------- ["over", GameResult] | Sends the result of  
                            |                                                  | the game (winner, 
                            |                                                  | loser, reason)         
          Acknowledges the  |           "OK" ----------->                      |                         
          result of the     |                                                  |                         
          game              |                                                  |                         
                            |                                                  |                                       