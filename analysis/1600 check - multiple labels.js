"use strict";
/**
 * list all objects, which have multiple labels
 *
 * output
 * - "check - multiple labels" ... list per ontology of object with multiple labels
 */

// includes
var Q        = require( 'q' ),
    Log      = require( './util/log.js' ),
    OntoStore= require( './util/OntoStore' ),
    Structure= require( './config/structure' );

// local settings
var localCfg = {
      moduleName: 'check - multiple labels',
      moduleKey:  '1600'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };


function checkMultipleLabels() {

  log( 'finding entries with multiple labels' );

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
       
        // skip those without labels
        if( typeof entry.label == 'undefined' ) {
          continue;
        }

        // make sure the entry exists
        lookup[ entry[ type ] ] = lookup[ entry[ type ] ] || {};
        lookup[ entry[ type ] ][ entry.labelLang ] = lookup[ entry[ type ] ][ entry.labelLang ] || new Set();
        
        // add label
        lookup[ entry[ type ] ][ entry.labelLang ].add( entry.label );

      }

      // filter for those with more than one label
      var multiLabel = []
      Object.keys( lookup )
            .forEach( (uri) => {
              
              // shortcut
              var labels = lookup[ uri ];
              
              // check all languages
              Object.keys( labels )
                    .forEach( (lang) => {

                      // for those with multiple labels ...
                      if( labels[ lang ].size > 1 ) {
                        
                        // ... add to result 
                        multiLabel.push({
                          uri:    uri,
                          lang:   lang,
                          labels: [ ... labels[lang] ]
                        });
                        
                      }
                      
                    })
              
            })

      // add to result
      resultsPerOntology[ onto ] = resultsPerOntology[ onto ] || {};
      resultsPerOntology[ onto ][ type ] = multiLabel;

      // log
      log( '      ' + type + ': ' + multiLabel.length, multiLabel.length > 0 ? Log.WARNING : Log.MESSAGE );
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