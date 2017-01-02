"use strict";
/**
 * check the results of extract data
 * - do all necessary result files exist?
 * - do the contents of the files conform to the standard definition?
 *
 * output:
 * - none
 */

// includes
var Q         = require( 'q' ),
    Log       = require( './util/log.js' ),
    Structure = require( './config/structure.js' ),
    OntoStore = require( './util/OntoStore' );

// local settings
var localCfg = {
      moduleName: 'check - validate extraction',
      moduleKey:  '0520'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    },
    byUri = {
      'appField': 'appField',
      'dimension': 'dimension',
      'unit': 'unit',
      'system': 'system',
      'quantKind': 'quantKind'
    };


function check() {

  // get list of ontologies to check
  var ontos = OntoStore.getOntologies();

  // files to check
  var files = OntoStore.getResultTypes();

  // collect results
  var results = {};

  for( var i=0; i<ontos.length; i++ ) {

    log( 'checking ' + ontos[i] );

    for( var j=0; j<files.length; j++ ) {

      try {

        // get the needed data
        var data = OntoStore.getData( ontos[i], files[j] );

        // skip empty results
        if( data.length < 1 ) {
          continue;
        }

        // shortcut
        var curStructure = Structure[ files[j] ];

        // collect all keys and count
        const counts = {},
              total  = new Set(),
              allKeys = new Set(),
              uriKey = files[j] in byUri ? byUri[ files[j] ] : null;
        for (var d=0; d<data.length; d++) {
          Object.keys( data[d] )
                .forEach( (key) => {

                  // collect extracted keys for later checks
                  allKeys.add( key );

                  // exception for label and labelLang, which need to be combined
                  if( 'labelLang' == key ) { return; }
                  if( 'label'     == key ) {
                    // build composite key
                    if( data[d].labelLang ) {
                      key += '@' + data[d].labelLang || '';
                    }
                  }

                  // add to counts
                  counts[ key ] = counts[ key ] || new Set();
                  if( uriKey ) {
                    // count by URI, because there might be multiple entries (different language labels)
                    counts[ key ].add( data[d][ uriKey ] );
                  } else {
                    // add a placeholder as entries are uniqueID
                    counts[ key ].add( d );
                  }

                });

          // add to total
          if( uriKey ) {
            // count by URI, because there might be multiple entries (different language labels)
            total.add( data[d][ uriKey ] );
          } else {
            // add a placeholder as entries are uniqueID
            total.add( d );
          }

        }

        // check for superfluous properties
        allKeys.forEach( (key) => {
          if( !(key in curStructure) ) {
            log( '   superfluous property in ' + files[j] + ': ' + key, Log.ERROR );
          }
        });

        // check for required properties
        var keys = Object.keys( curStructure );
        for( var k=0; k<keys.length; k++ ) {
          if( (curStructure[ keys[k] ] !== Structure['OPTIONAL'])
              && !allKeys.has(keys[k]) ) {

            // log error message
            log( '   missing property in ' + files[j] + ': ' + keys[k], Log.ERROR );
            
            // add a zero entry for output in HTML later on
            // labelLang is the exception as we added that already in the extended label property
            if( 'labelLang' != keys[k] ) {
              counts[ keys[k] ] = new Set();
            }

          }

        }

        // replace Sets by their size
        Object.keys( counts )
          .forEach( (key) => {
            counts[ key ] = counts[ key ].size;
          });

        // add to results
        results[ ontos[i] ] = results[ ontos[i] ] || {};
        results[ ontos[i] ][ files[j] ] = counts;
        results[ ontos[i] ][ files[j] ]._total = total.size;

      } catch( e ){

        log( '   missing file: ' + files[j], Log.ERROR );

      }

    }
  }

  // persist results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, results );

  return Q( true );

}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  check().done();
} else {
  module.exports = check;
}