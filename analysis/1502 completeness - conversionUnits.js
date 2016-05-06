"use strict";
/**
 * check, whether all referenced units of conversion exist in the unit dataset
 *
 * output:
 * "completeness - conversionUnits" ... list per ontology of missing units
 */

// includes
var Q        = require( 'q' ),
    Log      = require( './util/log.js' ),
    OntoStore= require( './util/OntoStore' ),
    checkPresence = require( './util/checkPresence' );

// local settings
var localCfg = {
      moduleName: 'completeness - conversionUnits',
      moduleKey:  '1502'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };


function completenessConversionUnits() {

  log( 'checking completeness of conversion wrt to unit' );

  // prepare results
  var resultsPerOntology = {};

  // get list of ontologies to check
  var ontos = OntoStore.getOntologies();

  // check for each ontology
  for( var onto of ontos ) {

    // load data
    var unit        = OntoStore.getData( onto, 'unit' ),
        conversion  = OntoStore.getData( onto, 'conversion' );

    // get missing
    var missingUnit1 = checkPresence( conversion, unit, 'unit1', 'unit' ),
        missingUnit2 = checkPresence( conversion, unit, 'unit2', 'unit' ),
        missingUnit = missingUnit1.concat( missingUnit2 );

    // add to result
    resultsPerOntology[ onto ] = {
        unit:   missingUnit
    };

    // logging
    log( '   ' + onto + ' - total: ' + conversion.length );
    log( '      units: '    + missingUnit.length,   missingUnit.length   > 0 ? Log.WARNING : Log.MESSAGE );

  }

  // persist results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, resultsPerOntology );

  return Q( true );

}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  completenessConversionUnits().done();
} else {
  module.exports = completenessConversionUnits;
}