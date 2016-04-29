"use strict";
/**
 * count the entries per SynSet type for special cases:
 * * non-prefixed units
 */

//includes
var Q        = require( 'q' ),
    Log      = require( './util/log.js' ),
    OntoStore= require( './util/OntoStore' );

// local settings
var localCfg = {
      moduleName: 'countBySynSet_special',
      moduleKey: '6021'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };
                    


function countBySynSet() {
  
  // log
  log( 'counting ontology occurences in synsets' );
  
  // get list of ontologies to check
  var ontos = OntoStore.getOntologies();

  // cache results
  var results = {};
  
  // prepare results
  ontos.forEach( (onto) => {
    results[ onto ] = {};
  });
  
  /* XXXXXXXXXXXXXXXXXXXXXXXXXX non-prefixed units XXXXXXXXXXXXXXXXXXXXXXXXXX */
  
  // set type
  var type = 'mapUnit_noPrefix';
  ontos.forEach( (onto) => { results[onto][type] = 0; } );
  
  // load result data
  var data = OntoStore.getResult( 'mapUnit' );

  // traverse all results
  for( var synset of data ) {
    
    // skip prefixed units
    if( synset.isPrefixed() ) {
      continue;
    }
    
    // check for all ontos
    for( var onto of ontos ) {
      
      // check, if the respective entry contains a value from this ontology
      var contains = synset.getSynonyms().some( (syn) => syn.getOntology() == onto );
      
      // count
      results[ onto ][ type ] = results[ onto ][ type ] || 0;
      if( contains ) {
        results[ onto ][ type ] += 1;
      }
      
    }
    
  }
  
  // log
  log( '   counted non-prefixed units' );

  

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX persist XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  
  // persist results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, results );

  // done
  return Q( true );    

}


/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  countBySynSet().done(); 
} else { 
  module.exports = countBySynSet; 
}