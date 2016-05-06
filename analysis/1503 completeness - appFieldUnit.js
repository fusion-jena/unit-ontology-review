"use strict";
/**
 * check, whether all referenced units and application fields of appFieldUnit exist in the respective datasets
 *
 * output:
 * "completeness - appFieldUnit" ... list per ontology of missing units and application fields
 */

// includes
var Q        = require( 'q' ),
    Log      = require( './util/log.js' ),
    OntoStore= require( './util/OntoStore' ),
    checkPresence = require( './util/checkPresence' );

// local settings
var localCfg = {
      moduleName: 'completeness - appFieldUnit',
      moduleKey:  '1503'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };

function completenessAppFieldUnit() {

  log( 'checking completeness of appFieldUnit wrt to unit and appField' );

  // prepare results
  var resultsPerOntology = {};

  // get list of ontologies to check
  var ontos = OntoStore.getOntologies();

  // check for each ontology
  for( var onto of ontos ) {

    // load data
    var unit        = OntoStore.getData( onto, 'unit' ),
        appField     = OntoStore.getData( onto, 'appField' ),
        appFieldUnit = OntoStore.getData( onto, 'appFieldUnit' );

    // get missing
    var missingUnit    = checkPresence( appFieldUnit, unit,    'unit',    'unit' ),
        missingAppField = checkPresence( appFieldUnit, appField, 'appField', 'appField' );

    // add to result
    resultsPerOntology[ onto ] = {
        unit:    missingUnit,
        appField: missingAppField
    };

    // logging
    log( '   ' + onto + ' - total: ' + appFieldUnit.length );
    log( '      units: '    + missingUnit.length,    missingUnit.length    > 0 ? Log.WARNING : Log.MESSAGE );
    log( '      appField: '  + missingAppField.length, missingAppField.length > 0 ? Log.WARNING : Log.MESSAGE );

  }

  // persist results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, resultsPerOntology );

  return Q( true );

}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  completenessAppFieldUnit().done();
} else {
  module.exports = completenessAppFieldUnit;
}