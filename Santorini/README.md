# chri-davi

## /
* .gitignore - Directories and files to be ignored by git.
* README.md - The text you are currently reading.
* TESTME - Executes the project's unit tests. Run it in the terminal with "./TESTME". Describes which tests pass or fail.
* package.json - Describes metadata for this Node.js module.
* Directories week1, 2, 3 and 4 hold the files that were used for the course's warmup section.

### /Santorini

#### /Common
All code that both administrative components and player components need to access.

* board.js - Implements the specification of a Santorini board, which is the model for the game. Stores game state of the board and its workers.
* player.js - NOT IMPLEMENTED
* referee.js - NOT IMPLEMENTED
* rulechecker.js - Manages the various rules of the game by allowing admins and players to check for validity at all phases of the game.
* strategy.js - Immplements a strategy component for automatically choosing moves based on decision trees.
* worker.js - Stores data for a Worker, to be used by the board.

#### /Design
Contains our specifications and interfaces for the design of the Santorini game.

* board.js - Lays out designs for Boards, Workers, and a Rulechecker. Identifies all relevant method headers and data representations held by a single Santorini game instance. Well documented stubs with potential design choices, however not executable.
* plan.pdf - Specification designed for week 4's Design Task. Lays out the mechanics and pieces of software that need to be developed in order to support a working Santorini game system.
* playerandrules.js - Specification designed for week 6. Reevaluated the Rulechecker design that we came up with earlier, allowing players and admins to check the basic rules of the game. Also contains a specification interface for a Player, which the admin component will bring through all phases of the game.
* referee.js - Specification for a referee object, which manages the game and interfaces between the player and the game model. Moves the players through all phases of the game
* strategy.js - Specification for a strategy object, which creates turns for a Player object.

#### /Lib
All library-like code that may be needed.

* constants.js - Defines a set of constants to be used throughout the Santorini game.
* direction.js - Defines a set of coordinates that can be used to find positions based on cardinal direcitons. Also exposes some helper functions for parsing and converting between them.
* json.ne - Defines a nearley grammar for parsing JSON strings.
* jsongrammar.js - The compiled grammar from json.ne.
* utility.js - Exposes a set of helper functions for use by test harnesses. Includes a JSON parser, a Worker parser, and a BoardSpec parser.

#### /test
All of our unit tests for the various components.

* board-tests.js - All board-related unit tests.
* direction-tests.js - All direction-related unit tests.
* rulechecker-tests.js - All rulechecker-related unit tests.
* strategy-tests.js - All strategy-related unit tests.
* utility-tests.js - All utility-related unit tests.
* worker-tests.js - All worker-related unit tests.

### /6
Stores the test harness for week 6: Implementing Common Pieces

* xboard - Executable for running the board test harness. Interactively run it in the terminal with "./xboard" or give it a predifined input file with "./xboard < [JSON file input]". 

#### /board-tests
Stores the input files for use in the test fest. Each "in" file has a sequence of JSON inputs and each "out" files have the expected results to the corresponding input.

#### /Auxiliary
* xboard.js - The board test harness code used to take parse inputs and submit results.

### /7
Stores the test harness for week 7: Implementing the Rule Checker

* xrules - Executable for running the rules test harness. Interactively run it in the terminal with "./xrules" or give it a predifined input file with "./xrules < [JSON file input]".

#### /rules-tests
Stores the input files for use in the test fest. Each "in" file has a sequence of JSON inputs and each "out" files have the expected results to the corresponding input.

#### /Auxiliary
* xrules.js - The rulechecker test harness code used to take parse inputs and submit results.

### /8
Stores the test harness for week 8: Implementing the Player and its Strategy

* xstrategy - Executable for running the strategy test harness. Interactively run it in the terminal with "./xstrategy" or give it a predifined input file with "./xstrategy < [JSON file input]".

#### /strategy-tests
Stores the input files for use in the test fest. Each "in" file has a sequence of JSON inputs and each "out" files have the expected results to the corresponding input.

#### /Auxiliary
* xstrategy.js - The strategy test harness code used to take parse inputs and submit results.