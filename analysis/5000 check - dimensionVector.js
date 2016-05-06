"use strict";
/**
 * check the mapping of dimensions for errors:
 * - different dimension vectors within one synonym set
 *
 * output:
 * - "check - dimensionVector" ... list of contradicting dimension vectors
 */

// includes
var Q   = require( 'q' ),
    Log = require( './util/log.js' ),
    OntoStore= require( './util/OntoStore' );

// local settings
var localCfg = {
    moduleName: 'check - dimensionVector',
      moduleKey: '5000'
  },
  log = function( msg, type ) {
    Log( localCfg.moduleName, msg, type );
  };


function checkDimensionVector() {

  // log
  log( 'checking mapped dimensions' );

  // get dimension mapping
  var mapping = OntoStore.getResult( 'mapDimension' );

  // collect results
  var results = [];

  // check each SynSet
  for( var synset of mapping ) {

    // get list of synonyms
    var syns = synset.getSynonyms();

    // skip single object sets
    if( syns.length < 2 ) {
      continue;
    }

    // get dimension vectors for all included dimensions
    var vectors = syns.map( (syn) => { return syn.getVector(); } )

    // remove empty/unset dimension vectors
    vectors = vectors.filter( (vec) => { return vec.length > 0 } );

    // we need more than one to compare
    if( vectors.length < 2 ) {
      continue;
    }

    // convert vectors to strings for easier comparison
    vectors = vectors.map( (vector) => { return JSON.stringify( vector ); } );

    // find unique vectors
    var unique = new Set();
    vectors.forEach( (vector) => { unique.add( vector ); } );

    // if the is more than one unique vectors, something is wrong
    if( unique.size > 1 ) {

      // log
      log( '   found inconsistent dimension vectors', Log.WARNING );
      syns.forEach( (syn) => {
        log( '      - ' + syn.getURI(), Log.WARNING );
      });

      // add to results
      results.push(
        syns.map( (syn) => {
          return {
            uri: syn.getURI(),
            onto: syn.getOntology(),
            vector: syn.getVector()
          };
        })
      );

    }
  }

  // log
  if( results.length > 0 ) {
    log( '   found inconsistencies: ' + results.length, Log.WARNING );
    log( '   check log file', Log.WARNING );
  }

  // store results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, results );

  // done
  return Q( true );
}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  checkDimensionVector().done();
} else {
 module.exports = checkDimensionVector;
}
