
## Purpose of files in this directory

### plan.pdf
Overarching design of component structure for this project, and our plan for how to implement them iteratively.

### Player.js
An interface for a player of a Santorini game. Exposes methods that
allow an Admin to take it through the game, including asking it for
each of its moves and updating it on changing game state.

### StrategyInterface.js
An interface for a strategy that generates Actions in the Santorini
game. Intended for use by a Player object, the strategy behind the
scenes could be a remote component, an AI, a GUI, etc.
