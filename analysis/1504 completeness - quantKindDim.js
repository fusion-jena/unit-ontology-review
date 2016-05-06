"use strict";
/**
 * check, whether all referenced quantity kinds and dimensions of quantKindDim exist in the respective datasets
 *
 * output:
 * "completeness - quantKindDim" ... list per ontology of missing dimensions and quantity kinds
 */

// includes
var Q        = require( 'q' ),
    Log      = require( './util/log.js' ),
    OntoStore= require( './util/OntoStore' ),
    checkPresence = require( './util/checkPresence' );

// local settings
var localCfg = {
      moduleName: 'completeness - quantKindDim',
      moduleKey:  '1504'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };

function completenessQuantKindDim() {

  log( 'checking completeness of quantKindDim wrt to quantKind and dimension' );

  // prepare results
  var resultsPerOntology = {};

  // get list of ontologies to check
  var ontos = OntoStore.getOntologies();

  // check for each ontology
  for( var onto of ontos ) {

    // load data
    var quantKind    = OntoStore.getData( onto, 'quantKind' ),
        dimension    = OntoStore.getData( onto, 'dimension' ),
        quantKindDim = OntoStore.getData( onto, 'quantKindDim' );

    // get missing
    var missingQk  = checkPresence( quantKindDim, quantKind, 'quantKind', 'quantKind' ),
        missingDim = checkPresence( quantKindDim, dimension, 'dimension', 'dimension' );

    // add to result
    resultsPerOntology[ onto ] = {
        quantKind: missingQk,
        dimension: missingDim
    };

    // logging
    log( '   ' + onto + ' - total: ' + quantKindDim.length );
    log( '      quantKind: '  + missingQk.length,  missingQk.length  > 0 ? Log.WARNING : Log.MESSAGE );
    log( '      dimension: '  + missingDim.length, missingDim.length > 0 ? Log.WARNING : Log.MESSAGE );

  }

  // persist results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, resultsPerOntology );

  return Q( true );

}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  completenessQuantKindDim().done();
} else {
  module.exports = completenessQuantKindDim;
}