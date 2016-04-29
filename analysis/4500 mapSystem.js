"use strict";
/**
 * map the systems of units of the ontologies to SynSets
 *
 */

// includes
var Q   = require( 'q' ),
    Log = require( './util/log.js' ),
    OntoStore   = require( './util/OntoStore' ),
    mapObjects  = require( './util/mapObjects' );

// local settings
var localCfg = {
    moduleKey: '4500',
    moduleName: 'mapSystem'
  },
  log = function( msg, type ) {
    Log( localCfg.moduleName, msg, type );
  };


function mapSystem() {

  // log
  log( 'matching systems of units' );
  
  // get application area list
  var systems = OntoStore.getResult( 'system' );
  
  // do the mapping
  var mapped = mapObjects({
    values: systems,
    manual: '4500 mapSystem.csv'
  }, log );
  
  // save the results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, mapped );

  // log output
  log( 'finished mapping systems of units' );
  log( '   systems: '    + systems.length );
  log( '   synonym sets: '  + mapped.length );
  
  // done
  return Q( true );
}
 
/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

//if called directly, execute, else export
if(require.main === module) {
  mapSystem().done(); 
} else { 
 module.exports = mapSystem; 
}
