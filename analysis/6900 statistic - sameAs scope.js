"use strict";
/**
 * Count the number of sameAs entries per known namespace
 *
 * output:
 * - "statistic - sameAs scope" ... counts per namespace
 */

//includes
var Q        = require( 'q' ),
    Log      = require( './util/log.js' ),
    OntoStore= require( './util/OntoStore' );

// local settings
var localCfg = {
      moduleName: 'statistic - sameAs scope',
      moduleKey: '6900'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };


function statisticSameAsScope() {

  // log
  log( 'counting sameAs' );

  // load namespaces
  var ns = {};
  OntoStore.loadPredefinedData( '6900 namespaces.csv' )
           .forEach( (entry) => {
             ns[ entry[0] ] = entry[1];
           });
  var nsPrefixes = Object.keys( ns );
  log( '   loaded namespaces' );

  // collect results
  var results = {};

  // get ontologies
  var ontos = OntoStore.getOntologies();

  // process all sameAs files
  for( var onto of ontos ) {

    // load sameAs
    var data = OntoStore.getData( onto, 'sameAs' );

    // collect counts
    var counts = {};
    results[ onto ] = counts;

    // process all entries
    for( var entry of data ) {

      // compare against all namespaces
      var matchNsS = null,
          matchNsO = null;
      for( var prefix of nsPrefixes ) {

        if( !matchNsS && (entry.object.indexOf( prefix ) == 0) ) {
          matchNsS = prefix;
        }
        if( !matchNsO && (entry.sameAs.indexOf( prefix ) == 0) ) {
          matchNsO = prefix;
        }

      }

      // resolve
      matchNsS = matchNsS ? ns[ matchNsS ] : 'unknown';
      matchNsO = matchNsO ? ns[ matchNsO ] : 'unknown';

      // determine the actual mapping
      var matchNs = null;
      if( matchNsS == onto ) {
        matchNs = matchNsO;
      } else {
        matchNs = matchNsS;
      }

      // add to count
      counts[ matchNs ] = counts[ matchNs ] || 0;
      counts[ matchNs ] += 1;

    }

  }

  // log
  log( '   counted links per target' );

  // persist results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, results );

  // done
  return Q( true );

}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  statisticSameAsScope().done();
} else {
  module.exports = statisticSameAsScope;
}