"use strict";
/**
 * check, whether all conversions included have either an offset or a factor
 *
 * output:
 * - "completeness - conversionValues" ... list of conversions per ontology with neither offset nor factor
 */

//includes
var Q        = require( 'q' ),
    Log      = require( './util/log.js' ),
    OntoStore= require( './util/OntoStore' ),
    checkPresence = require( './util/checkPresence' );

// local settings
var localCfg = {
      moduleName: 'completeness - conversionValues',
      moduleKey:  '1400'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };


function completenessConversionValues() {

  log( 'checking completeness of conversion wrt existance of factor/offset' );

  // prepare results
  var resultsPerOntology = {};

  // get list of ontologies to check
  var ontos = OntoStore.getOntologies();

  for( var onto of ontos ) {

    // load data
    var conversion  = OntoStore.getData( onto, 'conversion' );

    // collect incomplete
    var missing = [];
    for( var entry of conversion ) {
      if( !('convFactor' in entry) && !('convOffset' in entry) ){
        missing.push( entry );
      }
    }

    // add to result
    resultsPerOntology[ onto ] = {
        unit:   missing
    };

    // logging
    log( '   ' + onto + ': ' + missing.length, missing.length > 0 ? Log.WARNING : Log.MESSAGE );

  }

  // persist results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, resultsPerOntology );

  return Q( true );

}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  completenessConversionValues().done();
} else {
  module.exports = completenessConversionValues;
}