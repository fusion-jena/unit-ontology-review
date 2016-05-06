"use strict";
/**
 * map the quantity kinds of the ontologies to SynSets
 *
 * output
 * - "mapQuantKind" ... list of SynSets
 */

// includes
var Q   = require( 'q' ),
    Log = require( './util/log.js' ),
    OntoStore   = require( './util/OntoStore' ),
    mapObjects  = require( './util/mapObjects' );

// local settings
var localCfg = {
    moduleName: 'mapQuantKind',
    moduleKey: '4400'
  },
  log = function( msg, type ) {
    Log( localCfg.moduleName, msg, type );
  };


function mapQuantKind() {

  // log
  log( 'matching quantity kinds' );

  // get quantity kind list
  var quantKinds = OntoStore.getResult( 'quantKind' );

  // do the mapping
  var mapped = mapObjects({
    values: quantKinds,
    manual: '4400 mapQuantKind.csv'
  }, log );

  // save the results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, mapped );

  // log output
  log( 'finished mapping quantity kinds' );
  log( '   application fields: '    + quantKinds.length );
  log( '   synonym sets: '  + mapped.length );

  // done
  return Q( true );
}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  mapQuantKind().done();
} else {
 module.exports = mapQuantKind;
}
