// use an object with a state to represent the stream of input
// and all found json objects so far


// A JsonStream accepts a continuous string in pieces as input
// and parses sequential JSON values out of it
class JsonStream {

  // constructor: no args
  constructor() {
    // The JSON not yet parsed
    let unparsed = "";
    // The current JSON value being built up
    let processed = "";
    // The current numeric JSON value being built up
    let numBuf = "";
    // The stack of [], {}, "" characters to be matched
    let stack = [];
    // The array of completed JSON values parsed from the stream
    let jsons = [];
  }

  // add more unprocessed input to our buffer for parsing
  addInput(str) {
    this.unparsed += str;
  }

  // Get the JSON values built up so far.
  // responsibility of caller to call process() first to ensure
  // all available json has been processed and validated.
  getJsonValues() {
    return this.jsons;
  }

  // attempt to process the entire unparsed buffer
  process() {
    while (this.unparsed.length > 0) {
      // process the next character
      let nextChar = this.unparsed.substring(0,1);
      this.unparsed = this.unparsed.substring(1,this.unparsed.length);

      // If we ARE currently working on an array, string, or object:
      if (stack.length > 0) {
        // Then first of all, we don't care about newlines.
        if (nextChar == "\n") {
          continue;
        }
        this.processed += nextChar;
        // determine whether to manipulate the delimiter stack
        if (this.isDelimiter(nextChar)) {
          if (this.stack[0] == nextChar) {
            this.stack.pop();
            if (this.stack.length == 0) {
              let value = JSON.parse(this.processed);
              this.jsons.push(value);
              this.processed = "";
            }
          } else {
            this.stack.push(nextChar);
          }
        }
      }

      // if we are NOT currently working on an array, string, or object
      else if (this.stack.length == 0) {
        // if we are already working on a plain number,
        // determine whether to add to or finish it.
        if (numBuf != "") {
          // finish the number if next char is not number,
          // and do not continue b/c finish processing the next char below.
          if (isNan(nextChar)) {
            let number = JSON.parse(this.numBuf);
            this.jsons.push(number);
            this.numBuf = "";

          // Or, add to the number if next char is also number
          } else {
            this.numBuf += nextChar;
            continue;
          }

        // If no current number, start a new number, if we should.
        } else if (!isNan(nextChar)) {
          this.numBuf += nextChar;
          continue;
        }
        // Otherwise, add non-numeric character to processed buffer.
        // For valid JSON, it must either be newline/space, or a delimiter.
        // must check for delimiter as part of processing it.

        // Add char if not newline or space.
        if (nextChar != "/n" && nextChar != " ") {
          if (this.isDelimiter(nextChar)) {
            this.stack.push(nextChar);
            this.processed += nextChar;
          } else {
            throw "Detected invalid JSON!";
          }
        }
      }

        // if it matches the top thing on the stack, pop stack
        // and add char to buffer
        // else just add char to buffer
      }

      // if stack is empty, parse the json

    }

    isDelimiter(char) {
      return char == "\"" ||
             char == "[" ||
             char == "]" ||
             char == "{" ||
             char == "}";
    }

  }
