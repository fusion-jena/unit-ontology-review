"use strict";
/**
 * check, whether all referencedapplication fields and quantity kinds of appFieldQantityKind exist in the respective datasets
 *
 * output:
 * "completeness - appFieldQuantKind" ... list per ontology of missing application fields and quantity kinds
 */

// includes
var Q        = require( 'q' ),
    Log      = require( './util/log.js' ),
    OntoStore= require( './util/OntoStore' ),
    checkPresence = require( './util/checkPresence' );

// local settings
var localCfg = {
      moduleName: 'completeness - appFieldQuantKind',
      moduleKey:  '1507'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };

function completenessAppFieldQuantKind() {

  log( 'checking completeness of appFieldUnit wrt to unit and appField' );

  // prepare results
  var resultsPerOntology = {};

  // get list of ontologies to check
  var ontos = OntoStore.getOntologies();

  // check for each ontology
  for( var onto of ontos ) {

    // load data
    var qk           = OntoStore.getData( onto, 'quantKind' ),
        appField     = OntoStore.getData( onto, 'appField' ),
        appFieldQk   = OntoStore.getData( onto, 'appFieldQuantKind' );

    // get missing
    var missingQK       = checkPresence( appFieldQk, qk,       'quantKind', 'quantKind' ),
        missingAppField = checkPresence( appFieldQk, appField, 'appField',  'appField' );

    // add to result
    resultsPerOntology[ onto ] = {
        qk:       missingQK,
        appField: missingAppField
    };

    // logging
    log( '   ' + onto + ' - total: ' + appFieldQk.length );
    log( '      qk: '        + missingQK.length,       missingQK.length       > 0 ? Log.WARNING : Log.MESSAGE );
    log( '      appField: '  + missingAppField.length, missingAppField.length > 0 ? Log.WARNING : Log.MESSAGE );

  }

  // persist results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, resultsPerOntology );

  return Q( true );

}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  completenessAppFieldQuantKind().done();
} else {
  module.exports = completenessAppFieldQuantKind;
}