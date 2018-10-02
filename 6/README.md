### Overview

This folder contains the deliverables for assignment 6:

* xboard - the executable that runs the test harness, accepting JSON over STDIN
and printing the results to STDOUT.
* test - a convenient wrapper around xboard that takes the number of the test
case to run and executes a diff against the expected output.
* board-tests - contains five system-level test cases in the form of pairs of
input and output JSON files.
* Aux - directory containing all Auxiliary files, including our test harness
implementation and one failing test case.


### Purpose of each test (\*-in.JSON, \*-out.json):

* 1: Check that occupied neighbor cells do show as occupied, and that the same cell is not shown as occupied if a worker moves out of it.
* 2: Workers on the 4 corners of the board, to test occupied? and neighbor queries on all relevant surrounding positions (on and/or off board)
* 3: Workers traversing paths of changing heights
* 4: Workers building up paths while following each other, building buildings of heights 3 and 4, and moving workers so that the game is in an end state.
* 5: Extremely long sequence of moving workers back and forth, to load test the system. Also splits JSON arrays onto multiple lines.
