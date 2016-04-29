"use strict";
/**
 * check, whether all referenced units and quantity kinds of quantKindUnit exist in the respective datasets
 */

//includes
var Q        = require( 'q' ),
    Log      = require( './util/log.js' ),
    OntoStore= require( './util/OntoStore' ),
    checkPresence = require( './util/checkPresence' );

// local settings
var localCfg = {
      moduleName: 'validateQuantKindUnit',
      moduleKey:  '1505'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };

function validateQuantKindUnit() {
  
  log( 'checking completeness of quantKindUnit wrt to quantKind and unit' );
  
  // prepare results
  var resultsPerOntology = {};
 
  // get list of ontologies to check
  var ontos = OntoStore.getOntologies();

  for( var onto of ontos ) {
    
    // load data
    var quantKind     = OntoStore.getData( onto, 'quantKind' ),
        unit          = OntoStore.getData( onto, 'unit' ),
        quantKindUnit = OntoStore.getData( onto, 'quantKindUnit' );

    // get missing
    var missingQk     = checkPresence( quantKindUnit, quantKind, 'quantKind', 'quantKind' ),
        missingUnit   = checkPresence( quantKindUnit, unit,      'unit',      'unit' ),
        missingParent = checkPresence( quantKindUnit, quantKind, 'parent',    'quantKind' );
    
    // add to result
    resultsPerOntology[ onto ] = {
        quantKind:  missingQk,
        unit:       missingUnit,
        parent:     missingParent
    };
    
    // logging
    log( '   ' + onto + ' - total: ' + quantKindUnit.length );
    log( '      quantKind: ' + missingQk.length,     missingQk.length     > 0 ? Log.WARNING : Log.MESSAGE );
    log( '      unit: '      + missingUnit.length,   missingUnit.length   > 0 ? Log.WARNING : Log.MESSAGE );
    log( '      parent: '    + missingParent.length, missingParent.length > 0 ? Log.WARNING : Log.MESSAGE );

  }
  
  // persist results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, resultsPerOntology );

  return Q( true );    

}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  validateQuantKindUnit().done(); 
} else { 
  module.exports = validateQuantKindUnit; 
}