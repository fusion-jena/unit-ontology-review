"use strict";
/**
 * map the application areas of the ontologies to SynSets
 *
 */

// includes
var Q   = require( 'q' ),
    Log = require( './util/log.js' ),
    OntoStore   = require( './util/OntoStore' ),
    mapObjects  = require( './util/mapObjects' );

// local settings
var localCfg = {
    moduleKey: '4300',
    moduleName: 'mapAppArea'
  },
  log = function( msg, type ) {
    Log( localCfg.moduleName, msg, type );
  };


function mapAppArea() {

  // log
  log( 'matching application areas' );
  
  // get application area list
  var appAreas = OntoStore.getResult( 'appArea' );
  
  // do the mapping
  var mapped = mapObjects({
    values: appAreas,
    manual: '4300 mapAppArea.csv'
  }, log );
  
  // save the results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, mapped );

  // log output
  log( 'finished mapping application areas' );
  log( '   application areas: '    + appAreas.length );
  log( '   synonym sets: '  + mapped.length );
  
  // done
  return Q( true );
}
 
/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

//if called directly, execute, else export
if(require.main === module) {
  mapAppArea().done(); 
} else { 
 module.exports = mapAppArea; 
}
