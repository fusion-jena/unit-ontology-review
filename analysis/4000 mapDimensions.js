"use strict";
/**
 * map the dimensions of the ontologies to SynSets
 *
 */

// includes
var Q   = require( 'q' ),
    Log = require( './util/log.js' ),
    OntoStore   = require( './util/OntoStore' ),
    mapObjects  = require( './util/mapObjects' );

// local settings
var localCfg = {
    moduleKey: '4000',
    moduleName: 'mapDimension'
  },
  log = function( msg, type ) {
    Log( localCfg.moduleName, msg, type );
  };


function mapDimensions() {

  // log
  log( 'matching dimensions' );
  
  // get dimension list
  var dimensions = OntoStore.getResult( 'dimension' );
  
  // do the mapping
  var mappedDimensions = mapObjects({
    values: dimensions,
    manual: [ '4000 mapDimension.csv', '4000 mapDimension_ext.csv' ]
  }, log );
  
  // save the results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, mappedDimensions );

  // log output
  log( 'finished mapping dimensions' );
  log( '   dimensions: '    + dimensions.length );
  log( '   synonym sets: '  + mappedDimensions.length );
  
  // done
  return Q( true );
}
 
/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

//if called directly, execute, else export
if(require.main === module) {
 mapDimensions().done(); 
} else { 
 module.exports = mapDimensions; 
}
