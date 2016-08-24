"use strict";
/**
 * convert the extracted list of quantity kinds to SemObject objects
 *
 * output:
 * - "quantKind" ... list of all converted quantity kinds
 * - "quantKind_perOnto" ... list of converted quantity kinds per ontology
 */

// includes
var Q                   = require( 'q' ),
    Log                 = require( './util/log.js' ),
    OntoStore           = require( './util/OntoStore' ),
    convertToSemObject  = require( './util/convertToSemObject' );

//local settings
var localCfg = {
    moduleName: 'quantKind',
    moduleKey: '2400'
  },
  log = function( msg, type ) {
    Log( localCfg.moduleName, msg, type );
  };

/**
 * convert the extracted list of quantity kinds to SemObject objects
 */
function semObjectQuantKinds() {

  // log
  log( 'parsing quantity kinds' );

  // results
  var resultsAll     = [],
      resultsPerOnto = {};

  // get list of ontologies
  var ontos = OntoStore.getOntologies();

  // process all ontologies
  for( var onto of ontos ) {

    // load raw ontology data
    var data = OntoStore.getData( onto, "quantKind" );

    // convert to SemObject instances
    var instances = convertToSemObject({
      values:     data,
      onto:       onto,
      type:       OntoStore.OBJECT,
      uriProp:    'quantKind',
      labelProp:  'label',
      langProp:   'labelLang',
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
  log( 'extracted quantity kinds: ' + resultsAll.length );

  // done
  return Q( true );
}


/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  semObjectQuantKinds().done();
} else {
 module.exports = semObjectQuantKinds;
}
