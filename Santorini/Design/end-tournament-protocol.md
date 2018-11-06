The following protocol is followed at the end of a tournament, and notifies the player
that the tournament has ended / gives them the results.

The following data definitions are used below:

* An EndGameReason represents why a game ended and is one of:
  * "WON": the winner won cleanly by boxing in an opponent or moving to a winning height
  * "BROKEN_RULE": the winner won because the loser broke a rule, timed out, etc.

* A GameResult is a: {winner: string, loser: string, reason: EndGameReason}
  * where the winner string is the name of the winner
  * the loser string is the name of the loser
        
                             Client                                              Server
                                |                                                  |                         
                                |     <---------- ["tournament_finished",          | The tournament is over,  
                                |                              [GameResult, ...]]  | and the list includes all game   
                                |                                                  | results of the tournament
        acknowledge the         |    "OK" ---------->                              |                                              
        end of the tournament   |                                                  |                           
       