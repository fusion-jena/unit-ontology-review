"use strict";
/**
 * find units, that are determined as prefixed by a heuristic, but not by ontology
 *
 * output:
 * - "heuristic - prefixed units" ... list per ontology of units not recognized as prefixed
 * - "unit_prefixHeuristic" ... list of SemUnit with heuristic information included
 */

// includes
var Q        = require( 'q' ),
    Log      = require( './util/log.js' ),
    OntoStore= require( './util/OntoStore' );

// local settings
var localCfg = {
      moduleName: 'heuristic - prefixed units',
      moduleKey: '3100'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    },
    fixes = { // custom fixes to reduce false positives
        'milli': 'milli(?!on\\b)',
        'micro': 'micro(?!n\\b)',
        'deci':  'deci(?!mal\\b)'
    };

function heuristicPrefixedUnits() {

  // log
  log( 'checking for unrecognized prefixed units' );

  // cache results
  var results = {};

  // load unit SynSets
  var data = OntoStore.getResult( 'unit' );

  // we will modify this array, so we need a (shallow) copy
  data = data.slice( 0 );

  // load prefix-labels
  var prefixLabels = OntoStore.getResult( 'prefix' )
                              .map( (entry) => {
                                var label = entry.getDisplayLabel().toLowerCase();
                                if( label in fixes ) {
                                  return fixes[ label ];
                                } else {
                                  return label;
                                }
                              });

  // create (unique) RegExp
  prefixLabels = [ ... new Set( prefixLabels ) ]
                   .map( (label) => {
                      return new RegExp( '\\b' + label, 'gi' )
                   });

  // build checker function
  var containsPrefix = function( str ) {
    for( var i=0; i<prefixLabels.length; i++ ) {
      if( prefixLabels[i].test( str ) ) {
        prefixLabels[i].lastIndex = 0;  // reset this RegExp
        return true;
      }
    }
    return false;
  }

  // hold results
  var results = {},
      count = 0;

  for( var i=0; i<data.length; i++ ) {

    // shortcut
    var unit = data[i];

    // does any label contain a prefix?
    var isPrefixed = unit.getLabels()
                         .reduce( ( isPrefixed, label ) => {
                           return isPrefixed || containsPrefix( label );
                         }, false);

    // we are just concerned with non prefixed
    if( !unit.isPrefixed() && isPrefixed ) {

      // get respective ontology
      var onto = unit.getOntology();

      // add to results
      results[ onto ] = results[ onto ] || new Set();
      results[ onto ].add( unit.getURI() );

      // replace unit object with clone (so we can modify)
      unit = unit.clone();
      data[i] = unit;

      // store prefix data with SemUnit object
      unit.isHeuristicPrefix( true );

      // for logging purposes
      count += 1;

    }

  }

  // persist results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, results );
  OntoStore.storeResult( localCfg.moduleKey, 'unit_prefixHeuristic', data );

  // log
  log( 'found unrecognized prefixed units: ' + count );

  // done
  return Q( true );

}


/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  heuristicPrefixedUnits().done();
} else {
  module.exports = heuristicPrefixedUnits;
}