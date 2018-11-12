Our main tasks for this rework were as follows:
1. Consolidate and rearrange data definitions and constants
2. Improve TournamentManager unit test coverage
3. Fix a bug in the Referee involving a series where both Players break 


Git commits:

* *Rename constants import from 'c' to 'constants' across project* - 
We frequently imported constants as just 'c' across the project. This change 
improved readability.
 
* *remove unneeded imports from tournament configuration comp* - Our configuration
component imported a number of unused components.

* *Consolidate data definitions, move data definitions to appropriate files* - 
Several important data definitions, like 'Turn' and 'MoveRequest', were
duplicated across files. This commit moved them to the appropriate place:
    * Turn-related data definitions were moved to the Player interface in Common.
    * Direction definitions were updated to reference the direction.js file.
    * GameResult definitions were updated to reference the game-result.js file.
    * Player implementations were updated to reference the definitions on the interface.
 
* *Move timeout constants to the Constants file* - any const variables in individual
files were moved into the constants.js file.

 
* *Clarify that timeouts are for observers in Referee and TM* - updated constructor
 parameter names so that it is obvious that timeouts passed in only affect the 
 observers and not the players.
 
* *Use only alphabetic values for players' names in the player name checker* - changed
the Regex used to validate player names so that only alphabetic and not 
alphanumeric values are accepted. Also updated the generator for unique names to match
that spec.

* *Use the ruleBreakersInMatch function on the match table to determine which players
cheated in the match between them* - refactored a TournamentManager method to 
avoid duplicating MatchTable logic.

* *Remove duplicate info from Observer impl purpose statement* - Deleted documentation
that was duplicated from the interface.

* *Update files to replace [GameResult, ...] with Match data type where appropriate* - 
We were using a list of GameResults in some places where we actually meant a Match. 
In this case, the meaning of an empty list was different than the signature indicated.
 
* *Fix bug in Referee where series was not terminated after a game where both 
players broke* - Added failing unit tests to capture the bug, which was a result of
having added false as an additional game result value, but not checking for this 
case in the method that ran a series of games. 
 
* *Tournament configuration generation file, plus additional generated test files* -
Module that generates a config file with a given number of players (for use
in load testing the TournamentManager).

* *Update signature of method in MatchTable* - changed formatting of a type.

* *Add another breaking player that breaks on all calls made to it, not just 
data request* - New player implementation that breaks more thoroughly.

* *Add TournamentManager unit tests to cover cheating-related state management
that was previously added* - Added unit tests to cover untested behavior from week 11.

* *refactor TM method name for clarity* - rename to indicate which type of players
are affected by the method call.

* *add skeleton for testing untested methods* - Added a skeleton of test cases in
preparation for the TM unit tests.

* *Slight changes to documentation from code review this morning* - update the 
documentation of the TournamentManager constructor and the ConfigureTournament
module.