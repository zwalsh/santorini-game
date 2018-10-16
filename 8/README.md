# Assignment 8

### Components Developed This Week
* Strategy:
    * The Strategy component has been split into a number of parts to
    properly separate concerns
    * The first is a strategy that chooses a turn for a Player, called
    the StayAliveStrategy. This strategy picks a move that will keep
    the Player alive for a given number of look-ahead rounds. It 
    necessarily also checks if the opponent can in in the given number
    of rounds.
    * Two strategies for placing Workers:
        * The DiagonalPlacementStrategy. This Strategy places a Worker
        along the diagonal from [0, 0] to [size - 1, size - 1] in the 
        first empty place.
        * The FarthestFromEnemyPlacementStrategy. This Strategy places
        a Worker in the empty location farthest from the nearest
        enemy to it.
    * One CompoundStrategy for use by the Player. This Strategy
    combines the two types of Strategies and is able to output a Turn
    in any scenario. This makes it simple for the Player to provide
    Turns to the Referee.    
    
* Referee:
    
    For the Referee, we made some design decisions regarding the flow
    of the game:
    * We shifted to a Turn-based approach, rather than a 
        single Action-based approach (which necessitated a change to
        the Player interface).
    * The Referee will now take two Players in and alternate between
        them, executing the Turns that they give and ending the game if
        either of them win (by reaching height 3), lose (by having no 
        available moves), or break the rules (by submitting an invalid
        move).
    

### Test Cases

* Test 1 - This test case uses a scenario where a Player does not die in two 
look-ahead round (but would die in three) and shows that the Strategy reports
that they can survive for two rounds.
* Test 2 - This case uses the same scenario as above, and shows that the
Strategy correctly reports that the Player cannot survive for three rounds.
* Test 3 - This test case involves boxing in a Player. It shows that the
Strategy correctly detects when a Player will lose if the opposing Player
deliberately takes an action that boxes them in.
* Test 4 - This test shows that the Strategy correctly detects that the 
Player will not survive when we pick a move for them where they will lose,
but options were available to them that would have allowed survival.
* Test 5 - This test involves surviving when it would be possible for the
opponent to win, if the Player took an action that helps the opponent
achieve victory (i.e. shows that the Strategy will see that it can make
a defensive choice in later rounds).