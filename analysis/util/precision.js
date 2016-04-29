var math = require('mathjs');
/**
 * calculates the precision of a number
 * the precision is the distance of the last significant digit
 * to the decimal point
 * if the last significant digit is greater than 1 it the precision will be negative
 * 
 * @param {number}  number
 */
module.exports = function precision(x) {
   
  // process absolute value
   x = math.abs(x);

  //catch special cases
  if ( math.equal(x,0) ) {
    return 0;
  }
  
  // split at decimal point
  x = (x + "").split(".");

  //if no digits after decimal point
  if (!x[1] || x[1].length === 0) {
    // return number of trailed zeros
    return -(x[0].match(/[0]*$/)[0].length);
  }
  
  // return number of digits after decimal point
  return x[1].length;
}
