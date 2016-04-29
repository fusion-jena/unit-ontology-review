"use strict";
/**
 * Compare the factors associated with the prefixes for mismatches
 */

//includes
var Q        = require( 'q' ),
    Log      = require( './util/log.js' ),
    OntoStore= require( './util/OntoStore' );

// local settings
var localCfg = {
      moduleName: 'checkPrefixFactor',
      moduleKey: '5600'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };


function checkPrefixFactor() {
  
  // log
  log( 'checking prefix factors' );
  
  // get prefix SynSets
  var mappedPrefixes = OntoStore.getResult( 'mapPrefix' );
  
  // collect mismatches
  var mismatches = [];

  // check
  for( var synset of mappedPrefixes ) {
    
    // get synonyms
    var syns = synset.getSynonyms();
    
    // the factor to compare against
    var factor = null;
    
    for( var entry of syns ) {

      // try to get the factor to compare against
      factor = factor || entry.getFactor();
      
      // check, if this entry has the same factor as the others
      if( entry.getFactor() && (factor != entry.getFactor()) ) {
        mismatches.push( synset );
        break;
      }
      
    }
    
  }
  
  // log
  log( '   found mismatches: ' + mismatches.length, mismatches.length > 0 ? Log.WARNING : Log.MESSAGE );
  
  // persist results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, mismatches );

  // done
  return Q( true );    

}


/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  checkPrefixFactor().done(); 
} else { 
  module.exports = checkPrefixFactor; 
}