"use strict";
/**
 * map the units of the ontologies to SynSets
 *
 * output
 * - "mapUnit" ... list of SynSets
 */

// includes
var Q   = require( 'q' ),
    Log = require( './util/log.js' ),
    OntoStore   = require( './util/OntoStore' ),
    mapObjects  = require( './util/mapObjects' );

// local settings
var localCfg = {
    moduleName: 'mapUnit',
    moduleKey: '4100'
  },
  log = function( msg, type ) {
    Log( localCfg.moduleName, msg, type );
  };


function mapUnits() {

  // log
  log( 'matching units' );

  // get unit list
  var units = OntoStore.getResult( 'unit_prefixHeuristic' );

  // do the mapping
  var mappedUnits = mapObjects({
    values: units,
    manual: [ '4100 mapUnit.csv', '4100 mapUnit_ext.csv' ]
  }, log );

  // save the results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, mappedUnits );

  // log output
  log( 'finished mapping units' );
  log( '   units: '         + units.length );
  log( '   synonym sets: '  + mappedUnits.length );

  // done
  return Q( true );
}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  mapUnits().done();
} else {
 module.exports = mapUnits;
}
