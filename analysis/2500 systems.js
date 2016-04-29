"use strict";
/**
 * convert the extracted list of system of units to SemObjects objects
 */

// includes
var Q                   = require( 'q' ),
    Log                 = require( './util/log.js' ),
    OntoStore           = require( './util/OntoStore' ),
    convertToSemObject  = require( './util/convertToSemObject' );

//local settings
var localCfg = {
    moduleKey: '2500',
    moduleName: 'system'
  },
  log = function( msg, type ) {
    Log( localCfg.moduleName, msg, type );
  };
  
/**
 * convert the extracted list of system of units to SemObjects objects
 */  
function convertSystem() {
  
  // log
  log( 'parsing systems of units' );

  // results
  var resultsAll     = [],
      resultsPerOnto = {};
  
  // get list of ontologies
  var ontos = OntoStore.getOntologies();
  
  // process all ontologies
  for( var onto of ontos ) {
    
    // load raw ontology data
    var data = OntoStore.getData( onto, "system" );
    
    // convert to SemObject instances
    var instances = convertToSemObject({
      values:     data,
      onto:       onto,
      type:       OntoStore.OBJECT,
      uriProp:    'system',
      labelProp:  'label'
    });
    
    // add to results
    resultsPerOnto[ onto ] = instances;
    Array.prototype.push.apply( resultsAll, instances );

    // log
    log( '   processed ' + onto + ': ' + instances.length );
    
  }
  
  // store results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, resultsAll );
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName + '_perOnto', resultsPerOnto );
  
  // log
  log( 'extracted systems of units: ' + resultsAll.length );
  
  // done
  return Q( true );
}
 
/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

//if called directly, execute, else export
if(require.main === module) {
  convertSystem().done(); 
} else { 
 module.exports = convertSystem; 
}
