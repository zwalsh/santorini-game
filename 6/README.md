This folder contains the deliverables for assignment 6:

* xboard - the executable that runs the test harness, accepting JSON over STDIN
and printing the results to STDOUT.
* test - a convenient wrapper around xboard that takes the number of the test
case to run and executes a diff against the expected output.
* board-tests - contains five system-level test cases in the form of pairs of
input and output JSON files.
* Aux - directory containing all Auxiliary files, including our test harness
implementation and one failing test case.
