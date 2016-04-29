"use strict";
// includes
var buildLookup   = require( './buildLookup' );

/**
 * check, that for each entry of src there is a corresponding entry in target
 * 
 * @param src
 * @param target
 * @param srcKey
 * @param targetKey
 */
function checkPresence( src, target, srcKey, targetKey ) {

  // list of missing
  var missing = new Set();
  
  // check, if there is actually something in the target dataset
  if( target.length > 0 ) {

    // build lookup
    var lookup  = buildLookup( target, targetKey );

    // check for unit existence
    for( var entry of src ) {
      if( entry[ srcKey ] && !(entry[ srcKey ] in lookup) ) {
        missing.add( entry[ srcKey ] );
      }
    }
    
  } else {
    
    // nothing present in the target dataset, so just list all (unique) entries of the source
    
    for( var entry of src ) {
      missing.add( entry[ srcKey ] );
    }
    
  }
  
  // return result
  return [ ... missing ];
  
}

module.exports = checkPresence;