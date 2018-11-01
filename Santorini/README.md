## /
* .gitignore - Directories and files to be ignored by git.
* README.md - The text you are currently reading.
* TESTME - Executes the project's unit tests. Run it in the terminal with "./TESTME". Describes which tests pass or fail.
* package.json - Describes metadata for this Node.js module.
* Directories week1, 2, 3 and 4 hold the files that were used for the course's warmup section.

### Santorini/

#### Common/
All code that both administrative components and player components need to access.

* board.js - Implements the specification of a Santorini board, which is the model for the game. Stores game state of the board and its workers.
* rulechecker.js - Manages the various rules of the game by allowing admins and players to check for validity at all phases of the game.
* worker.js - Stores data for a Worker, to be used by the board.
* observer-interface.js - Interface that any Observer implementation (for use in a Referee) should conform to.
* player-interface.js - Interface that any Player implementation should conform to.

#### Admin/
* referee.js - Contains the Referee component that manages a game (or series) between two Players.
* guarded-player.js - A wrapper for Player implementations that protects all calls to Players with timeouts and checks for exceptions.

#### Player/
* player.js - Implementation of a working Player that can
participate in a game of Santorini. This implementation uses a local AI Strategy
to generate worker placements and turns.
* strategy.js - Implements a strategy component for automatically choosing moves based on decision trees.
* player-breaker.js - A Player implementation that only returns malformed game data when asked for worker placements or turns.
* player-infinite.js - A Player implementation that only returns empty Promises, which never resolve into values, thereby simulating it entering an infinite loop.

#### Design/
Contains our specifications and interfaces for the design of the Santorini game.

* tournament-manager.js - Design for the component that will run a round-robin tournament of Santorini games between an arbitrary number of Players.
* tournament-result.js - Interface for the data container that a TournamentManager will use to return tournament results.

#### Observer/
* observer.js - An interface for a component that can observe (i.e. be notified
of) any externally significant events occurring in an interaction between two Players.


#### Lib/
All library-like code.

* constants.js - Defines a set of constants to be used throughout the Santorini game.
* direction.js - Defines a set of coordinates that can be used to find positions based 
on cardinal directions. Also exposes some helper functions for parsing and converting
 between them.
* json.ne - Defines a nearley grammar for parsing JSON strings.
* jsongrammar.js - The compiled grammar from json.ne.
* json-to-component.js - Exposes a set of helper functions for use by test harnesses.
 Includes a JSON parser, a Worker parser, and a BoardSpec parser.

#### test/
All of our unit tests for the various components. Every file in the Santorini project (that is not an imported package or library code) has a corresponding unit test file.

### 6/
Stores the test harness for week 6: Implementing Common Pieces

* xboard - Executable for running the board test harness. Interactively run it in the terminal with "./xboard" or give it a predifined input file with "./xboard < [JSON file input]". 

#### board-tests/
Stores the input files for use in the test fest. Each "in" file has a sequence of JSON inputs and each "out" files have the expected results to the corresponding input.

#### Auxiliary/
* xboard.js - The board test harness code used to take parse inputs and submit results.

### 7/
Stores the test harness for week 7: Implementing the Rule Checker

* xrules - Executable for running the rules test harness. Interactively run it in the terminal with "./xrules" or give it a predifined input file with "./xrules < [JSON file input]".

#### rules-tests/
Stores the input files for use in the test fest. Each "in" file has a sequence of JSON inputs and each "out" files have the expected results to the corresponding input.

#### Auxiliary/
* xrules.js - The rulechecker test harness code used to take parse inputs and submit results.

### 8/
Stores the test harness for week 8: Implementing the Player and its Strategy

* xstrategy - Executable for running the strategy test harness. Interactively run it in the terminal with "./xstrategy" or give it a predifined input file with "./xstrategy < [JSON file input]".

#### strategy-tests/
Stores the input files for use in the test fest. Each "in" file has a sequence of JSON inputs and each "out" files have the expected results to the corresponding input.

#### Auxiliary/
* xstrategy.js - The strategy test harness code used to take parse inputs and submit results.

### 10/

* xobserve - Executable for running a complete game of Santorini between two Players, managed by a Referee, with an Observer on the Referee printing significant actions in the game to stdout.

#### Auxiliary/
* observe-complete-ai-game.js - The file that xobserver runs.