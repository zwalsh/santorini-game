# Purpose

This project implements an (eventually) distributed version of the board game
Santorini. This folder contains the following:

* Admin - a directory for all administrator-specific code
* Player - a directory for all player-specific code (including strategies for 
playing the game - choosing both turns and worker placements)
* Common - a directory for all code that both player and admin components need,
including representations of a Board, a Player, a RuleChecker, and various
possible Actions
* Lib - a directory for library-type code including JSON parsing
* Design - a directory containing overarching plans for the general construction
 of this project, as well as interface designs for components to be implemented
 in the future.

# Testing

## Unit Tests

Unit tests for all modules in the Common and Lib directories are located in the
Test directory. Running the executable Test/allTests will run all unit tests.

## Integration Tests

### Board
There are tests for the Board component delivered in the 6 directory at the
root level of this project. They can be run using the xboard executable, which
takes JSON input from STDIN and prints the results to STDOUT. This input and
expected output is in the board-tests directory within 6.

### RuleChecker
Integration tests for the RuleChecker component are in the directory 7, at the root
level of this repository. The test cases are pairs of JSON-formatted input and
expected output files, located in the rules-tests directory within 7.
They can be run using the xrules executable, which takes JSON input from STDIN
and prints the results to STDOUT.

### Strategy
Integration tests for the Strategy component are in the directory 8, at the
root level of the repository. The test cases are (as above) pairs of JSON
input and output files. They can be run using the xstrategy executable, 
which takes JSON input from STDIN and prints to STDOUT.

# Roadmap

The central data of this system lives in the GameState and Board classes
(within Common). The RuleChecker class uses a GameState to check various
Actions for validity. The newly-designed Referee component will take
Players through all phases of the Santorini game.
