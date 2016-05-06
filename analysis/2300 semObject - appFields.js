"use strict";
/**
 * convert the extracted list of application fields to SemObjects objects
 *
 * output:
 * - "appField" ... list of all converted application fields
 * - "appField_perOnto" ... list of converted application fields per ontology
 */

// includes
var Q                   = require( 'q' ),
    Log                 = require( './util/log.js' ),
    OntoStore           = require( './util/OntoStore' ),
    convertToSemObject  = require( './util/convertToSemObject' );

//local settings
var localCfg = {
    moduleName: 'appField',
    moduleKey: '2300'
  },
  log = function( msg, type ) {
    Log( localCfg.moduleName, msg, type );
  };

/**
 * convert the extracted list of application fields to SemObjects objects
 */
function semObjectAppFields() {

  // log
  log( 'parsing application fields' );

  // results
  var resultsAll     = [],
      resultsPerOnto = {};

  // get list of ontologies
  var ontos = OntoStore.getOntologies();

  // process all ontologies
  for( var onto of ontos ) {

    // load raw ontology data
    var data = OntoStore.getData( onto, "appField" );

    // convert to SemObject instances
    var instances = convertToSemObject({
      values:     data,
      onto:       onto,
      type:       OntoStore.OBJECT,
      uriProp:    'appField',
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
  log( 'extracted application fields: ' + resultsAll.length );

  // done
  return Q( true );
}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  semObjectAppFields().done();
} else {
 module.exports = semObjectAppFields;
}
