"use strict";
/**
 * custom adaptations to distinguish between some units
 * 
 * suffixes taken from http://unitsofmeasure.org/ucum.html
 */

// map of the symbol suffixes
var suffixMap = {
    'tr': 'troy',
    'i':  'international',
    'us': 'us survey',  
    'br': 'uk',
    'm':  'metric',
    'av': 'avoirdupois',
    'ap': 'apothecaries'
};

// get list of suffixes to transform
var suffixList = Object.keys( suffixMap );


module.exports = function( raw, label ) {
  
  // second/minute of time vs angle
  if( (raw.unit.indexOf( '/plane-angle/' ) > 0)
      && (['second', 'minute' ].indexOf( raw.label ) > -1 ) ) {
    
    return label + ' plane angle';
    
  }
  
  // get suffix of symbol, if present
  var match = /_([a-zA-Z]+)/.exec( raw.symbol );
  if( match && (match.length > 1) ) {
    
    // we got a suffix
    var suffix = match[1].toLowerCase();
    
    // do we need to convert it?
    if( suffixList.indexOf( suffix ) > -1 ) {
      return label + ' ' + suffixMap[ suffix ];
    }
  }
  
  // /amount-of-information/bit-1
  if( raw.symbol == 'bit_s' ) {
    return label + ' (log dualis)';
  }
  
  return label;
}