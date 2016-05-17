"use strict";
/**
 * count the entries per SynSet type
 *
 * output:
 * - "statistic - individuals per ontology after mapping" ... counts of objects per ontology wrt to SynSets
 */

// includes
var Q        = require( 'q' ),
    Log      = require( './util/log.js' ),
    OntoStore= require( './util/OntoStore' );

// local settings
var localCfg = {
      moduleName: 'statistic - individuals per ontology after mapping',
      moduleKey: '6020'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    },
    countResults = [ 'mapDimension', 'mapUnit', 'mapAppField', 'mapQuantKind', 'mapSystem', 'mapPrefix' ];



function statisticIndividualsPerOntologyAfterMapping() {

  // log
  log( 'counting ontology occurences in synsets' );

  // get list of ontologies to check
  var ontos = OntoStore.getOntologies();

  // cache results
  var results = {};

  // prepare results
  ontos.forEach( (onto) => {
    results[ onto ] = {};
  });

  /* XXXXXXXXXXXXXXXXXXXXXXXXXX plain result types XXXXXXXXXXXXXXXXXXXXXXXXXX */

  for( var type of countResults ) {

    // load result data
    var data = OntoStore.getResult( type );

    // traverse all results
    for( var entry of data ) {

      // check for all ontologies
      for( var onto of ontos ) {

        // check, if the respective entry contains a value from this ontology
        var contains = entry.getSynonyms().some( (syn) => syn.getOntology() == onto );

        // count
        results[ onto ][ type ] = results[ onto ][ type ] || 0;
        if( contains ) {
          results[ onto ][ type ] += 1;
        }

      }

    }

    // log
    log( '   counted in ' + type );

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX persist XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  // persist results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, results );

  // done
  return Q( true );

}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  statisticIndividualsPerOntologyAfterMapping().done();
} else {
  module.exports = statisticIndividualsPerOntologyAfterMapping;
}