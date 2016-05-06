"use strict";
/**
 * check, whether there are duplicate/redundant conversions given within a single ontology
 *
 * output:
 * - "check - redundant conversions" ... list per ontology of redundant conversions
 */

// includes
var Q        = require( 'q' ),
    Log      = require( './util/log.js' ),
    OntoStore= require( './util/OntoStore' );

// local settings
var localCfg = {
      moduleName: 'check - redundant conversions',
      moduleKey:  '3200'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };


function checkRedundantConversions() {

  log( 'checking completeness of conversion wrt to unit' );

  // prepare results
  var resultsPerOntology = {};

  // get list of ontologies to check
  var ontos = OntoStore.getOntologies();

  for( var onto of ontos ) {

    // helper objects
    var cMap  = {},
        cVals = [];

    // load data
    var conversion  = OntoStore.getData( onto, 'conversion' );

    // add all conversions to the helper objects
    for( var entry of conversion ) {

      // add to map; also insert reverse direction
      cMap[ entry.unit1 ] = cMap[ entry.unit1 ] || {};
      cMap[ entry.unit2 ] = cMap[ entry.unit2 ] || {};
      var conv = cMap[ entry.unit1 ][ entry.unit2 ];
      if( !conv ) {
        conv = [];
        cMap[ entry.unit1 ][ entry.unit2 ] = conv;
        cMap[ entry.unit2 ][ entry.unit1 ] = conv;
        cVals.push( conv );
      }
      conv.push( entry );

    }

    // filter conversions that appear at least twice
    var dups = cVals.filter( (c) => c.length > 1 );

    // add to result
    resultsPerOntology[ onto ] = dups;

    // logging
    log( '   ' + onto );
    log( '      total: ' + conversion.length );
    log( '      duplicate/redundant: ' + dups.length, dups.length > 0 ? Log.WARNING : Log.MESSAGE );

  }

  // persist results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, resultsPerOntology );

  return Q( true );

}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  checkRedundantConversions().done();
} else {
  module.exports = checkRedundantConversions;
}