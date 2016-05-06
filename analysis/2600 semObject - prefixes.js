"use strict";
/**
 * convert the extracted list of prefixes to SemObjects objects
 *
 * output:
 * - "prefix" ... list of all converted prefixes
 * - "prefix_perOnto" ... list of converted prefixes per ontology
 */

// includes
var Q                   = require( 'q' ),
    Log                 = require( './util/log.js' ),
    OntoStore           = require( './util/OntoStore' ),
    convertToSemObject  = require( './util/convertToSemObject' );

//local settings
var localCfg = {
    moduleName: 'prefix',
    moduleKey: '2600'
  },
  log = function( msg, type ) {
    Log( localCfg.moduleName, msg, type );
  };

/**
 * convert the extracted list of prefixes to SemObjects objects
 */
function semObjectPrefixes() {

  // log
  log( 'parsing prefixes' );

  // results
  var resultsAll     = [],
      resultsPerOnto = {};

  // get list of ontologies
  var ontos = OntoStore.getOntologies();

  // process all ontologies
  for( var onto of ontos ) {

    // load raw ontology data
    var data = OntoStore.getData( onto, "prefix" );

    // convert to SemObject instances
    var instances = convertToSemObject({
      values:     data,
      onto:       onto,
      type:       OntoStore.PREFIX,
      uriProp:    'prefix',
      labelProp:  'label',
      addRaw:     true,
      entryCreated: function( raw, entry ) {

        // set factor
        if( 'factor' in raw ){
          entry.setFactor( raw.factor );
        }

      }
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
  log( 'extracted prefixes: ' + resultsAll.length );

  // done
  return Q( true );
}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  semObjectPrefixes().done();
} else {
 module.exports = semObjectPrefixes;
}
