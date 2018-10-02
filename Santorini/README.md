# Purpose

This project implements an (eventually) distributed version of the board game
Santorini. This folder contains the following:

* Admin - a directory for all administrator-specific code
* Player - a directory for all player-specific code
* Common - a directory for all code that both player and admin components need,
including representations of a Board, a Player, a RuleChecker, and various
possible Actions
* Lib - a directory for library-type code including JSON parsing
* Design - a directory containing overarching plans for the general construction
 of this project, as well as interface designs for components to be implemented
 in the future.

# Testing

There are tests for the Board component delivered in the 6 directory at the
root level of this project. They can be run using the xboard executable, which
takes JSON input from STDIN and prints the results to STDOUT. This input and
expected output is in the board-tests directory within 6.

# Roadmap

The central data of this system lives in the Board class (within Common).
The RuleChecker class uses a Board to check various Actions for validity. An
as-of-yet undefined admin component will create Players with RuleCheckers and
take those Players through all phases of the Santorini game. 
