"use strict";
/**
 * custom adaptations to fix a broken label
 * 
 */

module.exports = function( raw, label ) {
  
  // broken label for
  if( (raw.unit == 'http://qudt.org/vocab/unit#RadianPerMinute')
      && (raw.label == 'Radian per second' )) {
    return 'Radian per minute';
  }
  
  // remove label created using the URI from US Peck
  if( (raw.unit == 'http://qudt.org/vocab/unit#Peck')
      && (label == 'peck' )) {
    return 'peck us';
  }
  
  return label;
}