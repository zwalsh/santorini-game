let alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
let letters = alphabet.split('');

/* Given a numeric column index, generate corresponding letter string index */
function numberToLetters(n) {
  let boundary = 26;
  let length = 1;
  while (n >= boundary) {
    n -= boundary;
    boundary *= 26;
    length++;
  }
  let output = '';
  for (let i = 0; i < length; i++) {
    let digit = n % 26;
    output = letters[digit] + output;
    n = Math.floor(n/26);
  }
  return output;
}

/* Given a letter string column index, generate corresponding numeric index */
function lettersToNumber(str) {
  // sorry this does not work yet
  return -1;
}

module.exports = {
  'numberToLetters' : numberToLetters,
  'lettersToNumber' : lettersToNumber
};




/*
Step 1
Subtract 26, 26^2, ... to place number in correct space
Each subtraction means the string is 1 letter longer, track this

length = 1
if n > 26, -26, length++
if n > 676, -676, length++
if n > 17576, -17576, length++
...

Step 2
repeatedly (for $length times), mod n by 26 to get rightmost char,
then / by 26 for the next round

ex. AAD = 705

n = 705
705 > 26, so n = 679, length = 2
679 > 676, so n = 3, length = 3
for (length)
  n%26 -> digit
  n = floor(n/26)

*/
