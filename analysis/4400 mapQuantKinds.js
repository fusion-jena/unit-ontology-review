"use strict";
/**
 * map the quantity kinds of the ontologies to SynSets
 *
 */

// includes
var Q   = require( 'q' ),
    Log = require( './util/log.js' ),
    OntoStore   = require( './util/OntoStore' ),
    mapObjects  = require( './util/mapObjects' );

// local settings
var localCfg = {
    moduleKey: '4400',
    moduleName: 'mapQuantKind'
  },
  log = function( msg, type ) {
    Log( localCfg.moduleName, msg, type );
  };


function mapQuantKind() {

  // log
  log( 'matching quantity kinds' );
  
  // get application area list
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
  log( '   application areas: '    + quantKinds.length );
  log( '   synonym sets: '  + mapped.length );
  
  // done
  return Q( true );
}
 
/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

//if called directly, execute, else export
if(require.main === module) {
  mapQuantKind().done(); 
} else { 
 module.exports = mapQuantKind; 
}
