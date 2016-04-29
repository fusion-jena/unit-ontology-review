"use strict";
/**
 * try to find missed dimension mappings by comparing the dimension vectors of the SynSets
 */

// includes
var Q   = require( 'q' ),
    Log = require( './util/log.js' ),
    OntoStore= require( './util/OntoStore' );

// local settings
var localCfg = {
    moduleKey: '5100',
    moduleName: 'checkMissingMapDimensions'
  },
  log = function( msg, type ) {
    Log( localCfg.moduleName, msg, type );
  };

  
function checkMapDimensions() {

  // log
  log( 'checking mapped dimensions for missing' );
  
  // get dimension mapping
  var mapping = OntoStore.getResult( 'mapDimension' );
  
  // collect results
  var lookup = {};

  // create a lookup by dimension vector for all synsets
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
    
    // add the current synset for all included vectors in the lookup
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
      
      // map the synsets for output
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

//if called directly, execute, else export
if(require.main === module) {
  checkMapDimensions().done(); 
} else { 
 module.exports = checkMapDimensions; 
}
