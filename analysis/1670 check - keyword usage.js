"use strict";
/**
 * collect data about the usage of keywords like "per" and "reciprocal"
 *
 * output:
 * "check - keyword usage" ... list per ontology and keyword of units, whose label contains any of the given keywords
 */

//includes
var Q        = require( 'q' ),
    Log      = require( './util/log.js' ),
    OntoStore= require( './util/OntoStore' );

// local settings
var localCfg = {
      moduleName: 'check - keyword usage',
      moduleKey:  '1670'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    },
    keywords = {
      'per':        /\bper\b/gi,
      'reciprocal': /\breciprocal\b/gi,
      'negPower':   /power\s?(of)?\s-/gi
    };


function checkKeywordUsage() {

  log( 'searching for keywords in unit-labels' );
  log( '   #listed test-patterns: ' + Object.keys( keywords ).length );

  // prepare results
  var results = {};

  // keyword ids
  var keywordIds = Object.keys( keywords );

  // get list of ontologies to check
  var ontos = OntoStore.getOntologies();

  for( var onto of ontos ) {

    // log
    log( '   processing ' + onto );

    // load unit data
    var units = OntoStore.getData( onto, 'unit' );

    // prepare result
    results[ onto ] = {};

    // test all units
    units.forEach( (entry) => {

            // shortcut
            var label = entry.label;
            if( !label || ((''+label).trim() == '') ) {
              return;
            }

            // the result for this entry
            var entryRes = {};

            // test all keywords against the label
            keywordIds.forEach( (id) => {

              // test
              var matches = label.match( keywords[id] );
              if( matches ) {
                entryRes[ id ] = matches.length;
              }

            });

            // accumulate for global result
            powerset( Object.keys( entryRes ) )
              .forEach( (set) => {

                // skip empty set
                if( set.length < 1 ) {
                  return;
                }

                // create key
                set.sort();
                var key = JSON.stringify( set );

                // add to global result
                results[ onto ][ key ] = results[ onto ][ key ] || [];
                results[ onto ][ key ].push( entry.unit );

              });
          });

  }

  // persist results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, results );

  return Q( true );

}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Helper XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

/**
 * return the power set of the given array
 * https://rosettacode.org/wiki/Power_set#JavaScript
 * @param {Array} arr
 */
function powerset(arr) {
  var ps = [[]];
  for (var i=0; i < arr.length; i++) {
      for (var j = 0, len = ps.length; j < len; j++) {
          ps.push(ps[j].concat(arr[i]));
      }
  }
  return ps;
}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  checkKeywordUsage().done();
} else {
  module.exports = checkKeywordUsage;
}