"use strict";
/**
 * list all individuals, which have no labels
 *
 * output
 * - "check - missing labels" ... list per ontology of individuals with no labels
 */

// includes
var Q        = require( 'q' ),
    Log      = require( './util/log.js' ),
    OntoStore= require( './util/OntoStore' ),
    Structure= require( './config/structure' );

// local settings
var localCfg = {
      moduleName: 'check - missing labels',
      moduleKey:  '1601'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };


function checkMultipleLabels() {

  log( 'searching for individuals with no labels' );

  // find datasets with labels
  log( '   searching for datasets with labels' );
  var types = Object.keys( Structure )
                     .filter( (key) => {
                       return 'label' in Structure[ key ];
                     });
  log( '      found: ' + types.length );

  // prepare results
  var resultsPerOntology = {};

  // get list of ontologies to check
  var ontos = OntoStore.getOntologies();

  for( var onto of ontos ) {

    // log
    log( '   processing ' + onto );

    for( var type of types) {

      // load data
      var data = OntoStore.getData( onto, type );

      // create a label lookup
      var lookup = {};
      for( var entry of data ){

        // make sure entry is present
        lookup[ entry[ type ] ] = lookup[ entry[ type ] ] || new Set();

        // add label
        lookup[ entry[ type ] ].add( entry.label );

      }

      // filter for those with more than one label
      var missingLabel = []
      Object.keys( lookup )
            .forEach( (uri) => {

              // shortcut
              var labels = lookup[ uri ];

              // only one entry, which is "undefined" => missing label
              if( (labels.size == 1) && labels.has() ) {
                missingLabel.push( uri );
              }

            });

      // add to result
      resultsPerOntology[ onto ] = resultsPerOntology[ onto ] || {};
      resultsPerOntology[ onto ][ type ] = missingLabel;

      // log
      log( '      ' + type + ': ' + missingLabel.length, missingLabel.length > 0 ? Log.WARNING : Log.MESSAGE );
    }

  }

  // persist results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, resultsPerOntology );

  return Q( true );

}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  checkMultipleLabels().done();
} else {
  module.exports = checkMultipleLabels;
}