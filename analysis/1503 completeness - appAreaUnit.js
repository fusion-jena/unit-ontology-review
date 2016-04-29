"use strict";
/**
 * check, whether all referenced units and application areas of appAreaUnit exist in the respective datasets
 */

//includes
var Q        = require( 'q' ),
    Log      = require( './util/log.js' ),
    OntoStore= require( './util/OntoStore' ),
    checkPresence = require( './util/checkPresence' );

// local settings
var localCfg = {
      moduleName: 'validateAppArea',
      moduleKey:  '1503'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };

function checkAppArea() {
  
  log( 'checking completeness of appAreaUnit wrt to unit and appArea' );
  
  // prepare results
  var resultsPerOntology = {};
 
  // get list of ontologies to check
  var ontos = OntoStore.getOntologies();

  for( var onto of ontos ) {
    
    // load data
    var unit        = OntoStore.getData( onto, 'unit' ),
        appArea     = OntoStore.getData( onto, 'appArea' ),
        appAreaUnit = OntoStore.getData( onto, 'appAreaUnit' );

    // get missing
    var missingUnit    = checkPresence( appAreaUnit, unit,    'unit',    'unit' ),
        missingAppArea = checkPresence( appAreaUnit, appArea, 'appArea', 'appArea' );
    
    // add to result
    resultsPerOntology[ onto ] = {
        unit:    missingUnit,
        appArea: missingAppArea
    };
    
    // logging
    log( '   ' + onto + ' - total: ' + appAreaUnit.length );
    log( '      units: '    + missingUnit.length,    missingUnit.length    > 0 ? Log.WARNING : Log.MESSAGE );
    log( '      appArea: '  + missingAppArea.length, missingAppArea.length > 0 ? Log.WARNING : Log.MESSAGE );

  }
  
  // persist results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, resultsPerOntology );

  return Q( true );    

}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  checkAppArea().done(); 
} else { 
  module.exports = checkAppArea; 
}