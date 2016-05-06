"use strict";
/**
 * check, whether units are listed twice in prefixUnit
 *
 * output:
 * - "check - prefixUnit duplicates" ... list of duplicates per ontology
 */

// includes
var Q        = require( 'q' ),
    Log      = require( './util/log.js' ),
    OntoStore= require( './util/OntoStore' );

// local settings
var localCfg = {
      moduleName: 'check - prefixUnit duplicates',
      moduleKey:  '1000'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };


function dupSearch() {

  log( 'checking for duplicates in prefixUnit' );

  // prepare results
  var resultsPerOntology = {};

  // get list of ontologies to check
  var ontos = OntoStore.getOntologies();

  for( var onto of ontos ) {

    // load data
    var units = OntoStore.getData( onto, 'prefixUnit' );

    // build lookup
    var lookup = {};
    for( var entry of units ) {

      lookup[ entry.unit ] = lookup[ entry.unit ] || [];
      lookup[ entry.unit ].push( entry );

    }

    // find URIs with multiple entries
    var dups = Object.keys( lookup )
                     .filter( (key) => lookup[ key ].length > 1 )
                     .map( (key) => lookup[ key ] );

    // add to result
    resultsPerOntology[ onto ] = dups;

    // logging
    log( '   ' + onto + ' - total: ' + units.length );
    log( '      duplicates: ' + dups.length, dups.length > 0 ? Log.WARNING : Log.MESSAGE );

  }

  // persist results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, resultsPerOntology );

  return Q( true );

}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  dupSearch().done();
} else {
  module.exports = dupSearch;
}