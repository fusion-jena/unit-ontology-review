"use strict";
/**
 * count the entries per synset type
 */

//includes
var Q        = require( 'q' ),
    Log      = require( './util/log.js' ),
    OntoStore= require( './util/OntoStore' );

// local settings
var localCfg = {
      moduleName: 'countSynsets',
      moduleKey: '6050'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };


function countSynsets() {
  
  // get list of ontologies to check
  var ontos = OntoStore.getOntologies();

  // cache results
  var results = {};
  
  // types to check
  var types = OntoStore.getResultTypes();
  
  for( var type of types ) {
    
    // transform name to mapped version
    var name = 'map' + capitalizeFirstLetter( type );
    
    // synsets
    
    // try to get data
    var data = OntoStore.getResult( name );

    // only concerned with those types, that are mapped
    if( !data ) {
      continue;
    }
    
    // count, if there was a result
    var counts_mapped = data.length;
    
    // get respective plain data
    data = OntoStore.getResult( type );
    
    // add counts to result
    results[ type ] = {
        plain:  data.length,
        mapped: counts_mapped
    }
  }

  /*
   * capitalize the first letter of a string
   * from http://stackoverflow.com/a/1026087/1169798
   */
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
    
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX persist XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  
  // persist results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, results );

  // done
  return Q( true );    

}


/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  countSynsets().done(); 
} else { 
  module.exports = countSynsets; 
}