"use strict";
/**
 * check, whether all referenced units and dimensions of dimensionUnit exist in the respective datasets
 */

//includes
var Q        = require( 'q' ),
    Log      = require( './util/log.js' ),
    OntoStore= require( './util/OntoStore' ),
    checkPresence = require( './util/checkPresence' );

// local settings
var localCfg = {
      moduleName: 'validateDimensionUnit',
      moduleKey:  '1500'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };


function checkDimensionUnit() {
  
  log( 'checking completeness of dimensionUnit wrt to unit and dimension' );
  
  // prepare results
  var resultsPerOntology = {};
 
  // get list of ontologies to check
  var ontos = OntoStore.getOntologies();

  for( var onto of ontos ) {
    
    // load data
    var unit    = OntoStore.getData( onto, 'unit' ),
        dim     = OntoStore.getData( onto, 'dimension' ),
        dimUnit = OntoStore.getData( onto, 'dimensionUnit' );

    // get missing
    var missingUnit = checkPresence( dimUnit, unit, 'unit',      'unit' ),
        missingDim  = checkPresence( dimUnit, dim,  'dimension', 'dimension' );
    
    // add to result
    resultsPerOntology[ onto ] = {
        unit: missingUnit,
        dim: missingDim
    };
    
    // logging
    log( '   ' + onto + ' - total: ' + dimUnit.length );
    log( '      units: '      + missingUnit.length, missingUnit.length > 0 ? Log.WARNING : Log.MESSAGE );
    log( '      dimension: '  + missingDim.length,  missingDim.length  > 0 ? Log.WARNING : Log.MESSAGE );

  }
  
  // persist results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, resultsPerOntology );

  return Q( true );    

}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  checkDimensionUnit().done(); 
} else { 
  module.exports = checkDimensionUnit; 
}