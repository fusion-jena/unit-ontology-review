"use strict";
/**
 * check, whether all referenced units and prefixes of prefixUnit exist in the respective datasets
 */

//includes
var Q        = require( 'q' ),
    Log      = require( './util/log.js' ),
    OntoStore= require( './util/OntoStore' ),
    checkPresence = require( './util/checkPresence' );

// local settings
var localCfg = {
      moduleName: 'validatePrefixUnit',
      moduleKey:  '1501'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };


function checkPrefixUnit() {
  
  log( 'checking completeness of prefixUnit wrt to unit and prefix' );
  
  // prepare results
  var resultsPerOntology = {};
 
  // get list of ontologies to check
  var ontos = OntoStore.getOntologies();

  for( var onto of ontos ) {
    
    // load data
    var unit        = OntoStore.getData( onto, 'unit' ),
        prefix      = OntoStore.getData( onto, 'prefix' ),
        prefixUnit  = OntoStore.getData( onto, 'prefixUnit' );

    // get missing
    var missingUnit   = checkPresence( prefixUnit, unit,    'unit', 'unit' ),
        missingPrefix = checkPresence( prefixUnit, prefix,  'prefix', 'prefix' );
    
    // add to result
    resultsPerOntology[ onto ] = {
        unit:   missingUnit,
        prefix: missingPrefix
    };
    
    // logging
    log( '   ' + onto + ' - total: ' + prefixUnit.length );
    log( '      units: '    + missingUnit.length,   missingUnit.length   > 0 ? Log.WARNING : Log.MESSAGE );
    log( '      prefixes: ' + missingPrefix.length, missingPrefix.length > 0 ? Log.WARNING : Log.MESSAGE );

  }
  
  // persist results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, resultsPerOntology );

  return Q( true );    

}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  checkPrefixUnit().done(); 
} else { 
  module.exports = checkPrefixUnit; 
}