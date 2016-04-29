"use strict";
/**
 * map the prefixs of the ontologies to SynSets
 *
 */

// includes
var Q   = require( 'q' ),
    Log = require( './util/log.js' ),
    OntoStore   = require( './util/OntoStore' ),
    mapObjects  = require( './util/mapObjects' );

// local settings
var localCfg = {
    moduleKey: '4600',
    moduleName: 'mapPrefix'
  },
  log = function( msg, type ) {
    Log( localCfg.moduleName, msg, type );
  };


function mapPrefix() {

  // log
  log( 'matching prefixes' );
  
  // get application area list
  var prefixes = OntoStore.getResult( 'prefix' );
  
  // do the mapping
  var mapped = mapObjects({
    values: prefixes,
    manual: '4600 mapPrefix.csv'
  }, log );
  
  // save the results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, mapped );

  // log output
  log( 'finished mapping prefixes' );
  log( '   prefixes: '    + prefixes.length );
  log( '   synonym sets: '  + mapped.length );
  
  // done
  return Q( true );
}
 
/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

//if called directly, execute, else export
if(require.main === module) {
  mapPrefix().done(); 
} else { 
 module.exports = mapPrefix; 
}
