"use strict";
/**
 * count per type: plain values as extracted and mapped SynSets
 *
 * output:
 * - "statistic - individual reduction by mapping" ... counts per type
 */

// includes
var Q        = require( 'q' ),
    Log      = require( './util/log.js' ),
    OntoStore= require( './util/OntoStore' );

// local settings
var localCfg = {
      moduleName: 'statistic - individual reduction by mapping',
      moduleKey: '6050'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };

function statisticIndividualReductionByMapping() {

  // get list of ontologies to check
  var ontos = OntoStore.getOntologies();

  // cache results
  var results = {};

  // types to check
  var types = OntoStore.getResultTypes();

  for( var type of types ) {

    // transform name to mapped version
    var name = 'map' + capitalizeFirstLetter( type );

    // SynSets

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

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX persist XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  // persist results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, results );

  // done
  return Q( true );

}

/*
 * capitalize the first letter of a string
 * from http://stackoverflow.com/a/1026087/1169798
 */
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  statisticIndividualReductionByMapping().done();
} else {
  module.exports = statisticIndividualReductionByMapping;
}