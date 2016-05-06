"use strict";
/**
 * check for unit that are imprecise, e.g. "gallon" vs "gallon (us)" and "gallon (uk)"
 *
 * output:
 * - "check - vague designation" ... list of units with vague designation
 */

// includes
var Q   = require( 'q' ),
    Log = require( './util/log.js' ),
    OntoStore   = require( './util/OntoStore' );

// local settings
var localCfg = {
    moduleName: 'check - vague designation',
    moduleKey: '5550'
  },
  log = function( msg, type ) {
    Log( localCfg.moduleName, msg, type );
  };


function checkVagueDesignation() {

  // log
  log( 'searching for imprecise units' );

  // get dimension list
  var units = OntoStore.getResult( 'mapUnit' );

  // load system modifiers
  var modifiers = OntoStore.loadPredefinedData( '2100 systemModifier.csv' )
                           .map( (mod) => new RegExp( '\\b' + mod[0] + '\\b', 'gi' ) );

  // remove any addition in parenthesis
  modifiers.unshift( /[\(\[].*?[\)\]]/gi );

  // building a lookup by name, but removing the modifiers
  var lookup = {};
  for( var unit of units ) {

    // get label for this SynSet
    var label = unit.getDisplayLabel();

    // remove all modifiers
    label = label.replace(/\s+/g, ' ');
    for( var modifier of modifiers ) {
      label = label.replace( modifier, '' );
    }
    label = label.replace(/\s\s+/g, ' ');
    label = label.trim();

    // add to lookup group
    lookup[ label ] = lookup[ label ] || [];
    lookup[ label ].push( unit );

  }

  // find groups with more than one entry
  var results = [];
  Object.keys( lookup )
        .forEach( (key) => {
          if( lookup[ key ].length > 1 ){
            results.push({
              label: key,
              units: lookup[ key ]
            });
          }
        });

  // filter for just those, where there is an unspecified version included
  results = results.filter( (set) => {

    // get the label of the set
    var label = set.label;

    // look for matches
    for( var unit of set.units ) {
      if( label == unit.getDisplayLabel() ) {
        return true;
      }
    }

    // no match found
    return false;

  });

  // save the results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, results );

  // log output
  log( '... done' );
  log( '   found sets: ' + results.length );

  // done
  return Q( true );
}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  checkVagueDesignation().done();
} else {
 module.exports = checkVagueDesignation;
}
