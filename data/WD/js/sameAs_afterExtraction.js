"use strict";
/**
 * build URIs for sameAs relationships
 */

module.exports = function( entry ) {
  
  // only trigger on sameAs entries
  if( !('sameAs' in entry) ) {
    return entry;
  }
  
  // check, if we really have a formatter
  if( ('formatter' in entry) && (entry.formatter != '') ) {
    
    // build URI
    entry.sameAs = entry.sameAs.replace( /(.*)/, entry.formatter );
    
    // remove formatter
    delete entry.formatter;
    
  }
  
  return entry;
}