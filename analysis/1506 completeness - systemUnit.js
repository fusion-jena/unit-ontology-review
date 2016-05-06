"use strict";
/**
 * check, whether all referenced units of systemUnit exist in the unit dataset
 */

// includes
var Q        = require( 'q' ),
    Log      = require( './util/log.js' ),
    OntoStore= require( './util/OntoStore' ),
    checkPresence = require( './util/checkPresence' );

// local settings
var localCfg = {
      moduleName: 'completeness - systemUnit',
      moduleKey:  '1506'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };

function completenessSystemUnit() {

  log( 'checking completeness of quantKindUnit wrt to quantKind and unit' );

  // prepare results
  var resultsPerOntology = {};

  // get list of ontologies to check
  var ontos = OntoStore.getOntologies();

  // check for each ontology
  for( var onto of ontos ) {

    // load data
    var unit       = OntoStore.getData( onto, 'unit' ),
        system     = OntoStore.getData( onto, 'system' ),
        systemUnit = OntoStore.getData( onto, 'systemUnit' );

    // get missing
    var missingUnit   = checkPresence( systemUnit, unit,   'unit',   'unit' ),
        missingSystem = checkPresence( systemUnit, system, 'system', 'system' );

    // add to result
    resultsPerOntology[ onto ] = {
        unit:       missingUnit,
        system:     missingSystem
    };

    // logging
    log( '   ' + onto + ' - total: ' + systemUnit.length );
    log( '      unit: '      + missingUnit.length,   missingUnit.length   > 0 ? Log.WARNING : Log.MESSAGE );
    log( '      system: '    + missingSystem.length, missingSystem.length > 0 ? Log.WARNING : Log.MESSAGE );

  }

  // persist results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, resultsPerOntology );

  return Q( true );

}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  completenessSystemUnit().done();
} else {
  module.exports = completenessSystemUnit;
}