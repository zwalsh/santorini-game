To join a Santorini Tournament, a client will do the following:
        
                     Client                                         Server
                        |                                             |                
    opens a socket      |  socket.open()  ---------->                 |  
    to the server       |                                             |                
                        |                                             |
    join with name      |  ["join", name] ---------->                 |                                              
                        |                                             | one of two responses:     
                        |                                             |                
                        |                 <---------- "OK"            | the player's name 
                        |                                             | is unique and acceptable 
                        |                                             | 
                        |                 <---------- ["name", name]  | the player must 
                        |                                             | use the new name             
    accept new name     |            "OK" ---------->                 |                
                        |                                             |                
                        |                                             |                