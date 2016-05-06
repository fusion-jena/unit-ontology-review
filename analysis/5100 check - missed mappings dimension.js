"use strict";
/**
 * try to find missed dimension mappings by comparing the dimension vectors of the SynSets
 *
 * output:
 * - "check - missed mappings dimension" ... SynSets of dimensions, which share the same dimension vector
 */

// includes
var Q   = require( 'q' ),
    Log = require( './util/log.js' ),
    OntoStore= require( './util/OntoStore' );

// local settings
var localCfg = {
    moduleName: 'check - missed mappings dimension',
    moduleKey: '5100'
  },
  log = function( msg, type ) {
    Log( localCfg.moduleName, msg, type );
  };


function checkMissedMappingsDimension() {

  // log
  log( 'checking mapped dimensions for missing' );

  // get dimension mapping
  var mapping = OntoStore.getResult( 'mapDimension' );

  // collect results
  var lookup = {};

  // create a lookup by dimension vector for all SynSets
  for( var synset of mapping ) {

    // get list of synonyms
    var syns = synset.getSynonyms();

    // get dimension vectors for all included dimensions
    var vectors = syns.map( (syn) => { return syn.getVector(); } )

    // remove empty/unset dimension vectors
    vectors = vectors.filter( (vec) => { return vec.length > 0 } );

    // we need a vector for comparison
    if( vectors.length < 1 ) {
      continue;
    }

    // convert vectors to strings for easier comparison
    vectors = vectors.map( (vector) => { return JSON.stringify( vector ); } );

    // remove duplicates
    var vectorSet = new Set( vectors );

    // add the current SynSet for all included vectors in the lookup
    for( var vector of vectorSet.values() ) {
      lookup[ vector ] = lookup[ vector ] || [];
      lookup[ vector ].push( synset );
    }

  }

  // check, for vectors, that occur in multiple dimensions
  var vectors = Object.keys( lookup ),
      results = [];
  for( var vector of vectors ) {

    // look for hits
    if( lookup[ vector ].length > 1 ) {

      // map the SynSets for output
      var entries = lookup[ vector ]
                    .map( (synset) => {
                      return synset.getSynonyms()
                                   .map( (obj) => obj.getURI() );
                    });

      // include in result list
      results.push({
        dimVector: vector,
        entries: entries,
        labels: lookup[ vector ].map( synset => synset.getLabels() )
      });
    }

  }

  // log
  if( results.length > 0 ) {
    log( '   found poss. missing mappings: ' + results.length, Log.WARNING );
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
  checkMissedMappingsDimension().done();
} else {
 module.exports = checkMissedMappingsDimension;
}
