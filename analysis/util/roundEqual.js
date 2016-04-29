var math = require('mathjs'),
    precision  = require( './precision' );
/**
 * Checks if two numbers can (not must) be rounded numbers of an common number.
 * The minimum precision and number of digits can be adjusted.
 * The numbers have to met only one of both criteria.
 * 
 * @param {number}  first number
 * @param {number}  second number
 * @param {number}  minimum precision (default = 2)
 * @param {number}  minimum number of digits (default = 8)
 */
module.exports = roundEqual = function ( x, y, precisionMin, digitsMin) {
  
  // use bignumbers from mathjs
  x = math.bignumber(x);
  y = math.bignumber(y);
  
  //set precisionMin
  precisionMin = math.bignumber(precisionMin || 2);
  digitsMin = math.bignumber(digitsMin || 6);
  // calculate precision of the leading digits
  var leadingDigitPrecisionX = math.chain(x).abs().log10().round().multiply(-1).done();
  var leadingDigitPrecisionY = math.chain(y).abs().log10().round().multiply(-1).done();
  // get max precision of leading digits (= leading digit precision of the smaller number)
  var leadingDigitPrecisionMax = math.max(leadingDigitPrecisionX,leadingDigitPrecisionY);
  // calculate min precision using min number of digits
  var digitsMinPrecision = math.chain(leadingDigitPrecisionMax).add(digitsMin).done();
  // use the lower min precisions (= "smaller obstacle" / only one criteria has to be met)
  precisionMin = math.min(precisionMin,digitsMinPrecision);
  
  // get precision
  var precisionX = math.max(precision(x),precisionMin);
  var precisionY = math.max(precision(y),precisionMin);
  var precisionMax = math.max(precisionX,precisionY);
    
  // calculate bounds
  /* 
   * bound: the smallest number greater and the greatest number
   * smaller as all possible original values without assuming a 
   * specific rounding method
   */
  var bigTen = math.bignumber(10);
  var lowerBoundX = math.subtract(x, math.pow(bigTen, -precisionX));
  var upperBoundX = math.add(x, math.pow(bigTen, -precisionX));
  var lowerBoundY = math.subtract(y, math.pow(bigTen, -precisionY));
  var upperBoundY = math.add(y, math.pow(bigTen, -precisionY));
  
  // check if ranges of original values are not distinct
  return ( math.equal(x, y)
        || lowerBoundX <= lowerBoundY && lowerBoundY <  upperBoundX // lower bound of y in range of x
        || lowerBoundX <  upperBoundY && upperBoundY <= upperBoundX // upper bound of y in range of x
        || lowerBoundY <= lowerBoundX && lowerBoundX <  upperBoundY // lower bound of x in range of y
        || lowerBoundY <  upperBoundX && upperBoundX <= upperBoundY // upper bound of x in range of y
        ); 
}
